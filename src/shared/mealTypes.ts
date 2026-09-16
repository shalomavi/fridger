/**
 * Multi-select meal-type preference, fed into the LLM prompt — matches the
 * check constraint in supabase/migrations/0015_household_meal_types.sql and
 * 0016_meal_types_vegan_vegetarian.sql. An empty set means no preference.
 *
 * Most of these are soft "favor this style" nudges (see
 * supabase/functions/suggest-meals/prompt.ts's STYLE_INSTRUCTIONS), but
 * dairy/meaty/vegan/vegetarian are hard dietary constraints instead
 * (prompt.ts's DIET_INSTRUCTIONS) — dairy and meaty specifically exclude
 * each other's ingredient (kosher-style meat/dairy separation), not just
 * favor one over the other.
 */
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
