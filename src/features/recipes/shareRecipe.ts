import type { Recipe } from './api'
import { formatMealShareText } from '@/domain/formatMealShareText'
import { UNITS } from '@/domain/units'
import type { Language } from '@/shared/i18n'
import { t } from '@/shared/i18n'

/** Same share flow as meals/shareMeal.ts, adapted to a recipe's flat
 * ingredient list (no uses/missing split once saved) — passed to
 * formatMealShareText as "uses" with an empty "missing", under the
 * "Ingredients:" label instead of "Uses:". */
export async function shareRecipeToWhatsApp(recipe: Recipe, lang: Language): Promise<void> {
  const unitLabels = Object.fromEntries(UNITS.map((u) => [u, t(lang, `unit_${u}`)])) as Record<
    (typeof UNITS)[number],
    string
  >
  const text = formatMealShareText(
    { name: recipe.name, uses: recipe.ingredients, missing: [], steps: recipe.steps },
    { uses: t(lang, 'ingredientsLabel'), alsoNeed: t(lang, 'alsoNeed') },
    unitLabels,
  )

  try {
    await navigator.clipboard.writeText(text)
  } catch {
    // Clipboard permission denied or unavailable — WhatsApp still gets the
    // text pre-filled below, so this is not fatal.
  }

  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener')
}
