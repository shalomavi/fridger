import type { Meal } from './api'
import { useLanguage } from '@/features/household/useLanguage'

export function SuggestionCard({
  meal,
  onCookedThis,
  cooking,
}: {
  meal: Meal
  onCookedThis: () => void
  cooking: boolean
}) {
  const { t } = useLanguage()

  return (
    <li className="space-y-3 rounded-lg bg-slate-800 p-4">
      <h3 className="text-lg font-medium text-teal-400">{meal.name}</h3>

      {meal.uses.length > 0 && (
        <p className="text-sm text-slate-400">
          <span className="text-slate-500">{t('uses')} </span>
          {meal.uses.join(', ')}
        </p>
      )}
      {meal.missing.length > 0 && (
        <p className="text-sm text-slate-400">
          <span className="text-slate-500">{t('alsoNeed')} </span>
          {meal.missing.join(', ')}
        </p>
      )}

      <ol className="list-decimal space-y-1 ps-4 text-sm text-slate-300">
        {meal.steps.map((step, i) => (
          <li key={i}>{step}</li>
        ))}
      </ol>

      <button
        onClick={onCookedThis}
        disabled={cooking}
        className="w-full rounded-lg bg-teal-600 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {cooking ? '…' : t('cookedThis')}
      </button>
    </li>
  )
}
