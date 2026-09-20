import { convertQuantity, type Unit } from './units'

export type Quantity = { quantity: number; unit: Unit }

/**
 * Combines two quantities when the same ingredient shows up twice — adding
 * to a pending shopping-list quantity, or buying more of something already
 * in the pantry. Converts the incoming amount into the existing row's unit
 * (kg<->g, L<->ml) so the result stays in one unit; returns null if the two
 * units aren't compatible (e.g. kg and ml), so the caller can fall back to
 * treating it as a separate row instead of merging nonsense.
 */
export function mergeQuantity(existing: Quantity, incoming: Quantity): Quantity | null {
  const converted = convertQuantity(incoming.quantity, incoming.unit, existing.unit)
  if (converted === null) return null
  return { quantity: existing.quantity + converted, unit: existing.unit }
}
