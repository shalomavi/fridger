import { useState } from 'react'
import { useSuggestions } from './useSuggestions'
import { SuggestionCard } from './SuggestionCard'
import type { Meal } from './api'

export function MealsScreen({ householdId }: { householdId: string }) {
  const { suggest, cookedThis } = useSuggestions(householdId)
  const [cookedName, setCookedName] = useState<string | null>(null)

  function onCookedThis(meal: Meal) {
    setCookedName(meal.name)
    cookedThis.mutate(meal, { onSettled: () => setCookedName(null) })
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => suggest.mutate(false)}
        disabled={suggest.isPending}
        className="w-full rounded-lg bg-teal-600 py-3 font-medium text-white disabled:opacity-50"
      >
        {suggest.isPending ? 'Thinking…' : 'Suggest a meal'}
      </button>

      {suggest.isError && (
        <p className="text-sm text-rose-400">
          Couldn't get suggestions right now. Try again in a moment.
        </p>
      )}

      {suggest.data?.fallback && (
        <p className="text-sm text-amber-400">
          Couldn't reach the AI — here are a few staples instead.
        </p>
      )}

      {suggest.data?.cached && (
        <p className="text-xs text-slate-500">
          Same as last time — your pantry hasn't changed.{' '}
          <button onClick={() => suggest.mutate(true)} className="underline">
            Get new ideas
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
