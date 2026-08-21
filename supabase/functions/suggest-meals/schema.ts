import { z } from 'zod'

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

/** Cache key: the sorted set of normalized pantry names, not the full
 * contents — buying one onion shouldn't invalidate every suggestion. */
export async function pantryHash(pantryNames: string[]): Promise<string> {
  const normalized = [...new Set(pantryNames.map(normalizeName))].sort()
  const bytes = new TextEncoder().encode(normalized.join('|'))
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}
