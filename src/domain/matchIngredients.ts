import { normalizeName } from './normalize'
import { convertQuantity, type Unit } from './units'

/**
 * "Cooked this" feedback loop (§5 of the plan): given the ingredients a
 * suggestion says it used (with quantity + unit) and the household's
 * current pantry, what should each matched pantry row's quantity become?
 * Pure matching + arithmetic only — the caller does the writes. A row whose
 * remaining quantity hits 0 is fully consumed by the caller rather than
 * left at a zero count. If the recipe's unit isn't compatible with the
 * pantry row's (e.g. recipe says "500 ml", pantry tracks "kg"), that
 * ingredient isn't reduced at all rather than guessing a conversion.
 */

export type MatchablePantryItem = { id: string; name: string; quantity: number; unit: Unit }
export type UsedIngredient = { name: string; quantity: number; unit: Unit }
export type PantryConsumption = { id: string; remainingQuantity: number; unit: Unit }

export function matchUsedIngredients(
  pantryItems: MatchablePantryItem[],
  used: UsedIngredient[],
): PantryConsumption[] {
  const usedByName = new Map(used.map((u) => [normalizeName(u.name), u]))
  return pantryItems
    .filter((item) => usedByName.has(normalizeName(item.name)))
    .map((item) => {
      const use = usedByName.get(normalizeName(item.name))!
      const usedInPantryUnit = convertQuantity(use.quantity, use.unit, item.unit) ?? 0
      return { id: item.id, remainingQuantity: Math.max(0, item.quantity - usedInPantryUnit), unit: item.unit }
    })
}
