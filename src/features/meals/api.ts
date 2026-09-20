import { supabase } from '@/shared/supabase'
import type { Language } from '@/shared/i18n'
import type { MealType } from '@/shared/mealTypes'
import type { Unit } from '@/domain/units'

export type UsedIngredient = { name: string; quantity: number; unit: Unit }

export type Meal = {
  name: string
  uses: UsedIngredient[]
  missing: string[]
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
  regenerate = false,
): Promise<SuggestResponse> {
  const { data, error } = await supabase.functions.invoke('suggest-meals', {
    body: { householdId, lang, preferences, mealTypes, regenerate },
  })
  if (error) throw error
  return data
}
