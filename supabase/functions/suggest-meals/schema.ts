import { z } from 'zod'

export type Language = 'en' | 'he'

// Same list as src/shared/mealTypes.ts — duplicated for the same
// cross-module-graph reason as normalizeName/isExpiringSoon below.
export const MEAL_TYPES = [
  'healthy',
  'fast',
  'trending',
  'unique',
  'budget',
  'comfort',
  'dairy',
  'meaty',
  'vegan',
  'vegetarian',
] as const
export type MealType = (typeof MEAL_TYPES)[number]

export function isMealType(value: string): value is MealType {
  return (MEAL_TYPES as readonly string[]).includes(value)
}

export const MealSchema = z.object({
  name: z.string().min(1),
  uses: z.array(z.string()),
  missing: z.array(z.string()),
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
 * preferences, and meal types — buying one onion or a date ticking closer
 * to expiry shouldn't invalidate every suggestion (expiry is deliberately
 * NOT part of this key), but switching any of the others must, or you'd
 * get back yesterday's answer in the wrong language, ignoring an allergy,
 * or ignoring a meal-type request. */
export async function pantryHash(
  pantryNames: string[],
  lang: Language,
  preferences: string | null,
  mealTypes: MealType[],
): Promise<string> {
  const normalized = [...new Set(pantryNames.map(normalizeName))].sort()
  const prefsPart = preferences?.trim() ?? ''
  const typesPart = [...mealTypes].sort().join(',')
  const bytes = new TextEncoder().encode(`${lang}|${prefsPart}|${typesPart}|${normalized.join('|')}`)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}
