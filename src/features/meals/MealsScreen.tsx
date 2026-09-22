import { useState } from 'react'
import { useSuggestions } from './useSuggestions'
import { SuggestionCard } from './SuggestionCard'
import { MealLoader } from './MealLoader'
import { SUGGESTION_MODES, type Meal, type SuggestionMode } from './api'
import { useLanguage } from '@/features/household/useLanguage'
import { useHousehold } from '@/features/household/useHousehold'
import { useToast } from '@/shared/alerts/ToastContext'
import { Button } from '@/shared/ui/Button'
import { statusTextClass } from '@/shared/ui/Badge'
import { elevationShadow, inactiveElevationShadow } from '@/shared/ui/elevation'
import { useTheme } from '@/shared/useTheme'

const MODE_LABEL_KEY: Record<SuggestionMode, 'suggestModePantry' | 'suggestModeAny'> = {
  pantry: 'suggestModePantry',
  any: 'suggestModeAny',
}

export function MealsScreen({ householdId }: { householdId: string }) {
  const { t, lang } = useLanguage()
  const { theme } = useTheme()
  const { data: household } = useHousehold()
  const { suggestion, suggest, cookedThis, addMissingToShoppingList } = useSuggestions(householdId)
  const { notify } = useToast()
  const [mode, setMode] = useState<SuggestionMode>('pantry')
  const [cookedName, setCookedName] = useState<string | null>(null)
  const [addingName, setAddingName] = useState<string | null>(null)

  function onCookedThis(meal: Meal) {
    setCookedName(meal.name)
    cookedThis.mutate(meal, { onSettled: () => setCookedName(null) })
  }

  function onAddMissing(meal: Meal) {
    setAddingName(meal.name)
    addMissingToShoppingList.mutate(meal, {
      onSuccess: (addedCount) =>
        notify(addedCount > 0 ? t('addedMissingToShoppingList') : t('missingAlreadyTracked'), 'success'),
      onError: () => notify(t('actionFailed'), 'error'),
      onSettled: () => setAddingName(null),
    })
  }

  function requestSuggestion(regenerate: boolean) {
    suggest.mutate({
      regenerate,
      lang,
      preferences: household?.preferences ?? null,
      mealTypes: household?.meal_types ?? [],
      mode,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {SUGGESTION_MODES.map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 rounded-lg px-3 py-1.5 text-sm transition-transform duration-300 active:scale-95 ${
              mode === m
                ? `${elevationShadow} bg-primary text-white`
                : `${inactiveElevationShadow[theme]} bg-surface text-text-soft`
            }`}
          >
            {t(MODE_LABEL_KEY[m])}
          </button>
        ))}
      </div>

      <Button
        onClick={() => requestSuggestion(false)}
        disabled={suggest.isPending}
        aria-label={suggest.isPending ? t('thinking') : undefined}
        className="w-full py-3"
      >
        {suggest.isPending ? <MealLoader /> : t('suggestAMeal')}
      </Button>

      {suggest.isError && <p className={`text-sm ${statusTextClass('danger')}`}>{t('suggestError')}</p>}

      {suggestion.data?.fallback && (
        <p className={`text-sm ${statusTextClass('warning')}`}>{t('fallbackNotice')}</p>
      )}

      {suggestion.data?.cached && (
        <p className="text-xs text-text-subtle">
          {t('cachedNotice')}{' '}
          <button onClick={() => requestSuggestion(true)} className="underline">
            {t('getNewIdeas')}
          </button>
        </p>
      )}

      {suggestion.data && (
        <ul className="space-y-3">
          {suggestion.data.meals.map((meal) => (
            <SuggestionCard
              key={meal.name}
              meal={meal}
              onCookedThis={() => onCookedThis(meal)}
              cooking={cookedThis.isPending && cookedName === meal.name}
              onAddMissing={() => onAddMissing(meal)}
              addingMissing={addMissingToShoppingList.isPending && addingName === meal.name}
            />
          ))}
        </ul>
      )}
    </div>
  )
}
