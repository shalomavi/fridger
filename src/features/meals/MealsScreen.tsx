import { useState } from 'react'
import { useSuggestions } from './useSuggestions'
import { SuggestionCard } from './SuggestionCard'
import type { Meal } from './api'
import { useLanguage } from '@/features/household/useLanguage'
import { useHousehold } from '@/features/household/useHousehold'

export function MealsScreen({ householdId }: { householdId: string }) {
  const { t, lang } = useLanguage()
  const { data: household } = useHousehold()
  const { suggestion, suggest, cookedThis } = useSuggestions(householdId)
  const [cookedName, setCookedName] = useState<string | null>(null)

  function onCookedThis(meal: Meal) {
    setCookedName(meal.name)
    cookedThis.mutate(meal, { onSettled: () => setCookedName(null) })
  }

  function requestSuggestion(regenerate: boolean) {
    suggest.mutate({ regenerate, lang, preferences: household?.preferences ?? null })
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => requestSuggestion(false)}
        disabled={suggest.isPending}
        className="w-full rounded-lg bg-teal-600 py-3 font-medium text-white disabled:opacity-50"
      >
        {suggest.isPending ? t('thinking') : t('suggestAMeal')}
      </button>

      {suggest.isError && <p className="text-sm text-rose-400">{t('suggestError')}</p>}

      {suggestion.data?.fallback && (
        <p className="text-sm text-amber-400">{t('fallbackNotice')}</p>
      )}

      {suggestion.data?.cached && (
        <p className="text-xs text-slate-500">
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
            />
          ))}
        </ul>
      )}
    </div>
  )
}
