import type { Meal } from './api'
import { shareMealToWhatsApp } from './shareMeal'
import { useLanguage } from '@/features/household/useLanguage'
import { Surface } from '@/shared/ui/Surface'
import { Button } from '@/shared/ui/Button'

export function SuggestionCard({
  meal,
  onCookedThis,
  cooking,
}: {
  meal: Meal
  onCookedThis: () => void
  cooking: boolean
}) {
  const { t, lang } = useLanguage()

  return (
    <Surface as="li" className="space-y-3 p-4">
      <h3 className="text-lg font-medium text-primary-accent">{meal.name}</h3>

      {meal.uses.length > 0 && (
        <p className="text-sm text-text-muted">
          <span className="text-text-subtle">{t('uses')} </span>
          {meal.uses.join(', ')}
        </p>
      )}
      {meal.missing.length > 0 && (
        <p className="text-sm text-text-muted">
          <span className="text-text-subtle">{t('alsoNeed')} </span>
          {meal.missing.join(', ')}
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
        <Button onClick={() => shareMealToWhatsApp(meal, lang)} className="flex-1 py-2 text-sm">
          {t('shareMeal')}
        </Button>
      </div>
    </Surface>
  )
}
