import { supabase } from '@/shared/supabase'
import type { Language } from '@/shared/i18n'
import type { MealType } from '@/shared/mealTypes'
import type { Unit } from '@/domain/units'
import type { Category } from '@/shared/categories'

export type UsedIngredient = { name: string; quantity: number; unit: Unit }
export type MissingIngredient = { name: string; quantity: number; unit: Unit; category: Category }

// 'pantry' anchors suggestions to what's on hand; 'any' drops that
// constraint so the household can browse meals regardless of pantry
// contents. Same shape either way — see the edge function's prompt.ts.
export const SUGGESTION_MODES = ['pantry', 'any'] as const
export type SuggestionMode = (typeof SUGGESTION_MODES)[number]

export type Meal = {
  name: string
  uses: UsedIngredient[]
  missing: MissingIngredient[]
  steps: string[]
}

export type SuggestResponse = {
  meals: Meal[]
  fallback: boolean
  cached: boolean
}

export async function suggestMeals(
  householdId: string,
  lang: Language,
  preferences: string | null,
  mealTypes: MealType[],
  mode: SuggestionMode,
  regenerate = false,
): Promise<SuggestResponse> {
  const { data, error } = await supabase.functions.invoke('suggest-meals', {
    body: { householdId, lang, preferences, mealTypes, mode, regenerate },
  })
  if (error) throw error
  return data
}
