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
