import { normalizeName } from './normalize'

/**
 * "Cooked this" feedback loop (§5 of the plan): given the ingredient names a
 * suggestion says it used and the household's current pantry, which pantry
 * rows should get consumed? Pure matching only — the caller does the writes.
 */

export type MatchablePantryItem = { id: string; name: string }

export function matchUsedIngredients(
  pantryItems: MatchablePantryItem[],
  usedNames: string[],
): string[] {
  const usedNormalized = new Set(usedNames.map(normalizeName))
  return pantryItems
    .filter((item) => usedNormalized.has(normalizeName(item.name)))
    .map((item) => item.id)
}
