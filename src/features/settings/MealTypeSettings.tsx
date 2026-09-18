import { useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { setHouseholdMealTypes } from '@/features/household/api'
import { useHousehold, useInvalidateHousehold } from '@/features/household/useHousehold'
import { useLanguage } from '@/features/household/useLanguage'
import { MEAL_TYPES, type MealType } from '@/shared/mealTypes'
import { elevationShadow } from '@/shared/ui/elevation'

/** Multi-select style nudge for meal suggestions (healthy, fast, etc.) — see
 * shared/mealTypes.ts. Chips toggle and save immediately, same as
 * CategoryOrderSettings, rather than needing an explicit Save button: each
 * tap is a complete, small change, not something worth batching. */
export function MealTypeSettings() {
  const { t } = useLanguage()
  const { data: household } = useHousehold()
  const invalidate = useInvalidateHousehold()
  const [selected, setSelected] = useState<MealType[]>([])
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    if (household && !dirty) setSelected(household.meal_types)
  }, [household, dirty])

  const save = useMutation({
    mutationFn: (next: MealType[]) => setHouseholdMealTypes(household!.id, next),
    onSuccess: async () => {
      await invalidate()
      setDirty(false)
    },
  })

  function toggle(type: MealType) {
    const next = selected.includes(type) ? selected.filter((m) => m !== type) : [...selected, type]
    setSelected(next)
    setDirty(true)
    save.mutate(next)
  }

  if (!household) return null

  return (
    <div className="space-y-2">
      <p className="text-sm text-text-muted">{t('mealTypeLabel')}</p>
      <div className="flex flex-wrap gap-2">
        {MEAL_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => toggle(type)}
            className={`rounded-full px-3 py-1.5 text-sm transition-transform duration-300 active:scale-95 ${elevationShadow} ${
              selected.includes(type) ? 'bg-primary text-white' : 'bg-surface text-text-soft'
            }`}
          >
            {t(`mealType_${type}`)}
          </button>
        ))}
      </div>
    </div>
  )
}
