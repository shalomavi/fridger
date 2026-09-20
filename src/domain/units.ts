/**
 * The small, fixed set of units quantity can be tracked in — grouped so
 * merges and "cooked this" reduction can convert within a group (kg<->g,
 * L<->ml) instead of doing raw arithmetic across incompatible units. See
 * CLAUDE.md: this is a fixed set, not a unit-conversion table users can
 * extend, and 'count' (the default) only ever converts to itself.
 */
export const UNITS = ['count', 'g', 'kg', 'ml', 'l'] as const
export type Unit = (typeof UNITS)[number]

const UNIT_GROUP: Record<Unit, string> = {
  count: 'count',
  g: 'weight',
  kg: 'weight',
  ml: 'volume',
  l: 'volume',
}

const BASE_PER_UNIT: Record<Unit, number> = { count: 1, g: 1, kg: 1000, ml: 1, l: 1000 }

export function sameUnitGroup(a: Unit, b: Unit): boolean {
  return UNIT_GROUP[a] === UNIT_GROUP[b]
}

/** Converts a quantity from one unit to another, or null if the two units
 * aren't in the same group (e.g. kg and ml) — the caller decides what to do
 * with an incompatible pair rather than this silently guessing. */
export function convertQuantity(value: number, from: Unit, to: Unit): number | null {
  if (!sameUnitGroup(from, to)) return null
  return (value * BASE_PER_UNIT[from]) / BASE_PER_UNIT[to]
}

const UNIT_ABBREVIATION: Record<Unit, string> = { count: '×', g: 'g', kg: 'kg', ml: 'ml', l: 'l' }

/** Same abbreviation in both languages — these are unit symbols, not UI
 * copy, so unlike everything else they don't go through i18n. */
export function unitAbbreviation(unit: Unit): string {
  return UNIT_ABBREVIATION[unit]
}

/** Trims to 2 decimal places without trailing zeros. */
export function formatNumber(value: number): string {
  return Number(value.toFixed(2)).toString()
}

/** Compact one-string display: "×2" for a plain count, "500g"/"1.5kg" etc
 * for a unit. */
export function formatQuantity(quantity: number, unit: Unit): string {
  const trimmed = formatNumber(quantity)
  return unit === 'count' ? `×${trimmed}` : `${trimmed}${unit}`
}
