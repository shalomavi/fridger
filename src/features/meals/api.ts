import { supabase } from '@/shared/supabase'

export type Meal = {
  name: string
  uses: string[]
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
  regenerate = false,
): Promise<SuggestResponse> {
  const { data, error } = await supabase.functions.invoke('suggest-meals', {
    body: { householdId, regenerate },
  })
  if (error) throw error
  return data
}
