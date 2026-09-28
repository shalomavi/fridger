import { z } from 'zod'

export type Language = 'en' | 'he'

// Same list as src/shared/categories.ts — duplicated for the same
// cross-module-graph reason as suggest-meals/schema.ts's own copy (this
// deploys to Deno, a separate module graph from the Vite frontend bundle,
// and from suggest-meals' own deployment).
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

// Same set as src/domain/units.ts — duplicated for the same reason.
export const UNITS = ['count', 'g', 'kg', 'ml', 'l'] as const
export type Unit = (typeof UNITS)[number]

const RecipeIngredientSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().positive(),
  unit: z.enum(UNITS),
  category: z.enum(CATEGORIES),
})

// The model reports whether the input was actually a recipe at all — an
// honest "couldn't find a recipe here" beats guessing at one, and there's
// no rule-based fallback engine for this (see CLAUDE.md). When isRecipe is
// false the other fields are simply absent, so the client never sees a
// half-built recipe.
const NotARecipeSchema = z.object({ isRecipe: z.literal(false) })
const ParsedRecipeSchema = z.object({
  isRecipe: z.literal(true),
  name: z.string().min(1),
  ingredients: z.array(RecipeIngredientSchema),
  steps: z.array(z.string()).min(1),
})

export const ParseResultSchema = z.union([ParsedRecipeSchema, NotARecipeSchema])
export type ParseResult = z.infer<typeof ParseResultSchema>
