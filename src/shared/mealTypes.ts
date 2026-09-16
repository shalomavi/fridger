/** Multi-select meal-type preference, fed into the LLM prompt as a "favor
 * this style" nudge (see supabase/functions/suggest-meals/prompt.ts) —
 * matches the check constraint in supabase/migrations/0015_household_meal_types.sql.
 * An empty set means no preference. */
export const MEAL_TYPES = [
  'healthy',
  'fast',
  'trending',
  'unique',
  'budget',
  'comfort',
  'dairy',
  'meaty',
] as const

export type MealType = (typeof MEAL_TYPES)[number]
