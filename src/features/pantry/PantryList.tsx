import { usePantry } from './usePantry'
import { PantryRow } from './PantryRow'
import { useHousehold } from '@/features/household/useHousehold'
import { useLanguage } from '@/features/household/useLanguage'
import type { TKey } from '@/shared/i18n'
import { resolveCategoryOrder } from '@/shared/categories'
import { groupByCategory } from '@/domain/groupByCategory'

export function PantryList({ householdId }: { householdId: string }) {
  const { t } = useLanguage()
  const { data: household } = useHousehold()
  const { data: items, isLoading, consume, updateAmount, updateCategory, updateExpiry } =
    usePantry(householdId)

  if (isLoading) return <p className="text-text-subtle">{t('loading')}</p>

  if (!items || items.length === 0) {
    return <p className="text-text-subtle">{t('pantryEmpty')}</p>
  }

  const order = resolveCategoryOrder(household?.category_order)

  return (
    <div className="space-y-4">
      {groupByCategory(items, order).map((group) => (
        <div key={group.category ?? 'uncategorized'}>
          <p className="mb-2 text-xs uppercase tracking-wide text-text-subtle">
            {group.category ? t(`category_${group.category}` as TKey) : t('uncategorized')}
          </p>
          <ul className="space-y-2">
            {group.items.map((item) => (
              <PantryRow
                key={item.id}
                item={item}
                onConsume={() => consume.mutate(item.id)}
                onUpdateAmount={(amount) => updateAmount.mutate({ id: item.id, amount })}
                onUpdateCategory={(category) => updateCategory.mutate({ id: item.id, category })}
                onUpdateExpiry={(expiresAt) => updateExpiry.mutate({ id: item.id, expiresAt })}
              />
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
