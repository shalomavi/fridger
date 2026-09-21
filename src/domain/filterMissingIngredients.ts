import { isSameIngredient } from './normalize'

type NamedItem = { name: string }

/**
 * "Add to shopping list" for a meal suggestion's missing ingredients: given
 * what the household already has tracked (pantry rows + pending shopping
 * items), returns only the missing ingredients not already covered by
 * either — no point re-adding something already in the fridge or already
 * queued to buy. Pure filtering only, caller does the writes.
 */
export function filterMissingIngredients<T extends NamedItem>(missing: T[], tracked: NamedItem[]): T[] {
  return missing.filter((item) => !tracked.some((t) => isSameIngredient(t.name, item.name)))
}
