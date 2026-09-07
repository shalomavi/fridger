import { useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { setHouseholdCategoryOrder } from '@/features/household/api'
import { useHousehold, useInvalidateHousehold } from '@/features/household/useHousehold'
import { useLanguage } from '@/features/household/useLanguage'
import { resolveCategoryOrder, type Category } from '@/shared/categories'

function moved(order: Category[], index: number, direction: -1 | 1): Category[] | null {
  const target = index + direction
  if (target < 0 || target >= order.length) return null
  const next = [...order]
  ;[next[index], next[target]] = [next[target], next[index]]
  return next
}

/** Sets the household-wide section order used to group both the shopping
 * list and the pantry by category (see domain/groupByCategory.ts). No
 * drag-and-drop — up/down buttons only, so no new dependency is needed for
 * what's a rarely-changed setting. */
export function CategoryOrderSettings() {
  const { t } = useLanguage()
  const { data: household } = useHousehold()
  const invalidate = useInvalidateHousehold()
  const [order, setOrder] = useState<Category[]>([])
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    if (household && !dirty) setOrder(resolveCategoryOrder(household.category_order))
  }, [household, dirty])

  const save = useMutation({
    mutationFn: (next: Category[]) => setHouseholdCategoryOrder(household!.id, next),
    onSuccess: () => {
      invalidate()
      setDirty(false)
    },
  })

  function move(index: number, direction: -1 | 1) {
    const next = moved(order, index, direction)
    if (!next) return
    setOrder(next)
    setDirty(true)
    save.mutate(next)
  }

  if (!household) return null

  return (
    <div className="space-y-2">
      <p className="text-sm text-text-muted">{t('categoryOrderLabel')}</p>
      <ul className="space-y-1">
        {order.map((category, i) => (
          <li
            key={category}
            className="flex items-center justify-between gap-2 rounded-lg bg-surface px-3 py-2"
          >
            <span className="text-text">{t(`category_${category}`)}</span>
            <div className="flex gap-1">
              <button
                onClick={() => move(i, -1)}
                disabled={i === 0}
                aria-label={t('moveCategoryUp')}
                className="rounded-md bg-surface-muted px-2 py-1 text-xs text-text-soft disabled:opacity-40"
              >
                ↑
              </button>
              <button
                onClick={() => move(i, 1)}
                disabled={i === order.length - 1}
                aria-label={t('moveCategoryDown')}
                className="rounded-md bg-surface-muted px-2 py-1 text-xs text-text-soft disabled:opacity-40"
              >
                ↓
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
