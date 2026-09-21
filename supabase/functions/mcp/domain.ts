// Duplicated from src/domain/{normalize,units,mergeQuantity,mergeDetails,purchaseItem}.ts
// and src/shared/categories.ts's CATEGORIES — importing across the module
// graph boundary doesn't work here: those files (or their siblings, in
// categories.ts's case, since src/shared/i18n does the same thing) use
// Vite-style extensionless relative imports internally (e.g.
// mergeQuantity.ts's `from './units'`), which Deno's stricter resolver
// rejects ("Module not found ... Maybe add a '.ts' extension"), confirmed
// by an actual `supabase functions serve mcp` boot failure. Same reasoning
// and same duplication suggest-meals/schema.ts already applies to
// normalizeName/isExpiringSoon/UNITS. Keep in sync with src/domain and
// src/shared/categories.ts if this logic ever changes — see CLAUDE.md's
// domain-purity boundary.

export const UNITS = ['count', 'g', 'kg', 'ml', 'l'] as const
export type Unit = (typeof UNITS)[number]

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

const UNIT_GROUP: Record<Unit, string> = { count: 'count', g: 'weight', kg: 'weight', ml: 'volume', l: 'volume' }
const BASE_PER_UNIT: Record<Unit, number> = { count: 1, g: 1, kg: 1000, ml: 1, l: 1000 }

export function sameUnitGroup(a: Unit, b: Unit): boolean {
  return UNIT_GROUP[a] === UNIT_GROUP[b]
}

export function convertQuantity(value: number, from: Unit, to: Unit): number | null {
  if (!sameUnitGroup(from, to)) return null
  return (value * BASE_PER_UNIT[from]) / BASE_PER_UNIT[to]
}

export function normalizeName(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, ' ')
}

export function isSameIngredient(a: string, b: string): boolean {
  return normalizeName(a) === normalizeName(b)
}

export type Quantity = { quantity: number; unit: Unit }

export function mergeQuantity(existing: Quantity, incoming: Quantity): Quantity | null {
  const converted = convertQuantity(incoming.quantity, incoming.unit, existing.unit)
  if (converted === null) return null
  return { quantity: existing.quantity + converted, unit: existing.unit }
}

export function mergeDetails(existing: string | null, incoming: string | null): string | null {
  const a = existing?.trim() || null
  const b = incoming?.trim() || null
  if (!a) return b
  if (!b) return a
  if (a === b) return a
  return `${a}, ${b}`
}

export type PurchasableItem = {
  id: string
  household_id: string
  name: string
  details: string | null
  category: string | null
  quantity: number
  unit: Unit
}

export function purchaseItem(item: PurchasableItem) {
  return {
    household_id: item.household_id,
    name: item.name,
    details: item.details,
    category: item.category,
    quantity: item.quantity,
    unit: item.unit,
    source_item_id: item.id,
    status: 'available' as const,
  }
}
