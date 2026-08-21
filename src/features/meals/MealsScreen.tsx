import { useState } from 'react'
import { useSuggestions } from './useSuggestions'
import { SuggestionCard } from './SuggestionCard'
import type { Meal } from './api'
import { useLanguage } from '@/features/household/useLanguage'

export function MealsScreen({ householdId }: { householdId: string }) {
  const { t, lang } = useLanguage()
  const { suggest, cookedThis } = useSuggestions(householdId)
  const [cookedName, setCookedName] = useState<string | null>(null)

  function onCookedThis(meal: Meal) {
    setCookedName(meal.name)
    cookedThis.mutate(meal, { onSettled: () => setCookedName(null) })
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => suggest.mutate({ regenerate: false, lang })}
        disabled={suggest.isPending}
        className="w-full rounded-lg bg-teal-600 py-3 font-medium text-white disabled:opacity-50"
      >
        {suggest.isPending ? t('thinking') : t('suggestAMeal')}
      </button>

      {suggest.isError && <p className="text-sm text-rose-400">{t('suggestError')}</p>}

      {suggest.data?.fallback && (
        <p className="text-sm text-amber-400">{t('fallbackNotice')}</p>
      )}

      {suggest.data?.cached && (
        <p className="text-xs text-slate-500">
          {t('cachedNotice')}{' '}
          <button onClick={() => suggest.mutate({ regenerate: true, lang })} className="underline">
            {t('getNewIdeas')}
          </button>
        </p>
      )}

      {suggest.data && (
        <ul className="space-y-3">
          {suggest.data.meals.map((meal) => (
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
