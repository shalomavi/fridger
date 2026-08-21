import { supabase } from '@/shared/supabase'
import type { Language } from '@/shared/i18n'

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
  lang: Language,
  regenerate = false,
): Promise<SuggestResponse> {
  const { data, error } = await supabase.functions.invoke('suggest-meals', {
    body: { householdId, lang, regenerate },
  })
  if (error) throw error
  return data
}
