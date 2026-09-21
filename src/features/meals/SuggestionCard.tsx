import type { Meal } from './api'
import { shareMealToWhatsApp } from './shareMeal'
import { formatQuantity } from '@/domain/units'
import { useLanguage } from '@/features/household/useLanguage'
import { Surface } from '@/shared/ui/Surface'
import { Button } from '@/shared/ui/Button'

export function SuggestionCard({
  meal,
  onCookedThis,
  cooking,
  onAddMissing,
  addingMissing,
}: {
  meal: Meal
  onCookedThis: () => void
  cooking: boolean
  onAddMissing: () => void
  addingMissing: boolean
}) {
  const { t, lang } = useLanguage()

  return (
    <Surface as="li" className="space-y-3 p-4">
      <h3 className="text-lg font-medium text-primary-accent">{meal.name}</h3>

      {meal.uses.length > 0 && (
        <p className="text-sm text-text-muted">
          <span className="text-text-subtle">{t('uses')} </span>
          {meal.uses
            .map((u) => `${u.name} ${formatQuantity(u.quantity, u.unit, t(`unit_${u.unit}`))}`)
            .join(', ')}
        </p>
      )}
      {meal.missing.length > 0 && (
        <p className="text-sm text-text-muted">
          <span className="text-text-subtle">{t('alsoNeed')} </span>
          {meal.missing
            .map((m) => `${m.name} ${formatQuantity(m.quantity, m.unit, t(`unit_${m.unit}`))}`)
            .join(', ')}
        </p>
      )}

      <ol className="list-decimal space-y-1 ps-4 text-sm text-text-soft">
        {meal.steps.map((step, i) => (
          <li key={i}>{step}</li>
        ))}
      </ol>

      <div className="flex gap-2">
        <Button onClick={onCookedThis} disabled={cooking} className="flex-1 py-2 text-sm">
          {cooking ? '…' : t('cookedThis')}
        </Button>
        <Button
          variant="surface"
          onClick={() => shareMealToWhatsApp(meal, lang)}
          className="flex-1 py-2 text-sm"
        >
          {t('shareMeal')}
        </Button>
      </div>

      {meal.missing.length > 0 && (
        <Button
          variant="surface"
          onClick={onAddMissing}
          disabled={addingMissing}
          className="w-full py-2 text-sm"
        >
          {addingMissing ? '…' : t('addMissingToShoppingList')}
        </Button>
      )}
    </Surface>
  )
}
