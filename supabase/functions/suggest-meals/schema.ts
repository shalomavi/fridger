import { z } from 'zod'

export type Language = 'en' | 'he'

// Same set as src/features/meals/api.ts's SuggestionMode — duplicated for
// the same cross-module-graph reason as normalizeName/isExpiringSoon below.
// 'pantry' anchors suggestions to what's on hand (today's only mode until
// now); 'any' drops that constraint so most/all ingredients can land in
// "missing" for a shopping-list run.
export const SUGGESTION_MODES = ['pantry', 'any'] as const
export type SuggestionMode = (typeof SUGGESTION_MODES)[number]

export function isSuggestionMode(value: string): value is SuggestionMode {
  return (SUGGESTION_MODES as readonly string[]).includes(value)
}

// Same list as src/shared/categories.ts — duplicated for the same
// cross-module-graph reason as normalizeName/isExpiringSoon below. Category
// assignment is normally manual-only (see that file), but here it's the
// LLM's own output for an ingredient it just named, not a name-based guess
// bolted onto user-entered text — same distinction as "uses"' unit field.
export const CATEGORIES = [
  'dairy',
  'produce',
  'meat',
  'bakery',
  'pantry',
  'frozen',
  'beverages',
  'snacks',
  'household',
  'hygiene',
  'other',
] as const
export type Category = (typeof CATEGORIES)[number]

// Same list as src/shared/mealTypes.ts — duplicated for the same
// cross-module-graph reason as normalizeName/isExpiringSoon below.
export const MEAL_TYPES = [
  'healthy',
  'fast',
  'trending',
  'unique',
  'budget',
  'comfort',
  'dessert',
  'dairy',
  'meaty',
  'vegan',
  'vegetarian',
  'pregnancy',
] as const
export type MealType = (typeof MEAL_TYPES)[number]

export function isMealType(value: string): value is MealType {
  return (MEAL_TYPES as readonly string[]).includes(value)
}

// Same set as src/domain/units.ts — duplicated for the same
// cross-module-graph reason as normalizeName/isExpiringSoon below.
export const UNITS = ['count', 'g', 'kg', 'ml', 'l'] as const
export type Unit = (typeof UNITS)[number]

const UsedIngredientSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().positive(),
  unit: z.enum(UNITS),
})

const MissingIngredientSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().positive(),
  unit: z.enum(UNITS),
  category: z.enum(CATEGORIES),
})

export const MealSchema = z.object({
  name: z.string().min(1),
  uses: z.array(UsedIngredientSchema),
  missing: z.array(MissingIngredientSchema),
  steps: z.array(z.string()).min(1),
})

export const SuggestionsSchema = z.object({
  meals: z.array(MealSchema).min(1).max(5),
})

export type Meal = z.infer<typeof MealSchema>

// Same rule as src/domain/normalize.ts: lowercase + trim + collapse
// whitespace, nothing else — no stemming, mixed Hebrew/English input.
// Duplicated here (not imported) because this function deploys to Deno,
// a separate module graph from the Vite frontend bundle. Keep both in sync
// if this logic ever changes.
export function normalizeName(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, ' ')
}

// Same threshold as src/domain/expiry.ts's isExpiringSoon — duplicated for
// the same cross-module-graph reason as normalizeName above.
const EXPIRING_SOON_DAYS = 3

export function isExpiringSoon(expiresAt: string | null, now = new Date()): boolean {
  if (!expiresAt) return false
  const diffDays = (new Date(expiresAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  return diffDays <= EXPIRING_SOON_DAYS
}

/** Cache key: the sorted set of normalized pantry names, the language,
 * preferences, meal types, and suggestion mode — buying one onion or a date
 * ticking closer to expiry shouldn't invalidate every suggestion (expiry is
 * deliberately NOT part of this key), but switching any of the others must,
 * or you'd get back yesterday's answer in the wrong language, ignoring an
 * allergy, ignoring a meal-type request, or from the wrong mode. */
export async function pantryHash(
  pantryNames: string[],
  lang: Language,
  preferences: string | null,
  mealTypes: MealType[],
  mode: SuggestionMode,
): Promise<string> {
  const normalized = [...new Set(pantryNames.map(normalizeName))].sort()
  const prefsPart = preferences?.trim() ?? ''
  const typesPart = [...mealTypes].sort().join(',')
  const bytes = new TextEncoder().encode(`${lang}|${prefsPart}|${typesPart}|${mode}|${normalized.join('|')}`)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}
