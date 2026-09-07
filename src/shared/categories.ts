/** Manual category tag for a shopping/pantry item — matches the check
 * constraint in supabase/migrations/0012_item_categories.sql. Assignment is
 * manual only (the user picks one), not guessed from the name: this app
 * takes mixed Hebrew/English entry and CLAUDE.md rules out building a name
 * lookup table (see "no ingredient taxonomy"), which is exactly what
 * auto-guessing would need. */
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
  'other',
] as const

export type Category = (typeof CATEGORIES)[number]

function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value)
}

/** A household can reorder categories (see settings/CategoryOrderSettings);
 * `stored` is that saved order, which may be stale — missing a category
 * this file has added since, or (in theory) carrying a bad value. Resolves
 * to a full, valid ordering: the stored prefix, then anything missing from
 * it, in this file's default order. */
export function resolveCategoryOrder(stored: readonly string[] | null | undefined): Category[] {
  const valid = (stored ?? []).filter(isCategory)
  const missing = CATEGORIES.filter((c) => !valid.includes(c))
  return [...valid, ...missing]
}
