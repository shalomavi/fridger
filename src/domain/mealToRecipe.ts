import type { Unit } from './units'
import type { Category } from '@/shared/categories'

type UsedIngredient = { name: string; quantity: number; unit: Unit }
type MissingIngredient = { name: string; quantity: number; unit: Unit; category: Category }
export type RecipeIngredient = { name: string; quantity: number; unit: Unit; category: Category }

/**
 * Flattens a meal suggestion's "uses" + "missing" split into one ingredient
 * list, for saving as a recipe (recipes have no pantry-relative state of
 * their own — see CLAUDE.md's recipes plan). "uses" entries get category
 * 'other': the model only assigns a category to "missing" ingredients (the
 * ones it's naming fresh for a shopping list), not to pantry items it
 * already matched — see src/shared/categories.ts.
 */
export function mealToRecipeIngredients(meal: {
  uses: UsedIngredient[]
  missing: MissingIngredient[]
}): RecipeIngredient[] {
  return [
    ...meal.uses.map((u) => ({ ...u, category: 'other' as Category })),
    ...meal.missing.map((m) => ({ name: m.name, quantity: m.quantity, unit: m.unit, category: m.category })),
  ]
}
