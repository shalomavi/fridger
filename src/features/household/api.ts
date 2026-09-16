import { supabase } from '@/shared/supabase'
import type { MealType } from '@/shared/mealTypes'

export type Language = 'en' | 'he'
export type Household = {
  id: string
  name: string
  language: Language
  preferences: string | null
  category_order: string[] | null
  meal_types: MealType[]
}

export const HOUSEHOLD_COLUMNS = 'id, name, language, preferences, category_order, meal_types'

/** The caller's household, or null if they haven't created/joined one yet. */
export async function getMyHousehold(): Promise<Household | null> {
  const { data: membership, error: membershipError } = await supabase
    .from('household_members')
    .select('household_id')
    .limit(1)
    .maybeSingle()
  if (membershipError) throw membershipError
  if (!membership) return null

  const { data: household, error } = await supabase
    .from('households')
    .select(HOUSEHOLD_COLUMNS)
    .eq('id', membership.household_id)
    .single()
  if (error) throw error
  return household
}

/** Shared setting — both members see the app and get suggestions in the same language. */
export async function setHouseholdLanguage(householdId: string, language: Language): Promise<void> {
  const { error } = await supabase.from('households').update({ language }).eq('id', householdId)
  if (error) throw error
}

/** Free text fed into the LLM prompt: allergies, dislikes, "no oven", etc. */
export async function setHouseholdPreferences(
  householdId: string,
  preferences: string,
): Promise<void> {
  const { error } = await supabase
    .from('households')
    .update({ preferences: preferences.trim() || null })
    .eq('id', householdId)
  if (error) throw error
}

/** Shared setting — the section order for both the shopping list and pantry. */
export async function setHouseholdCategoryOrder(
  householdId: string,
  categoryOrder: string[],
): Promise<void> {
  const { error } = await supabase
    .from('households')
    .update({ category_order: categoryOrder })
    .eq('id', householdId)
  if (error) throw error
}

/** Multi-select style nudge fed into the LLM prompt (see shared/mealTypes.ts) — empty means no preference. */
export async function setHouseholdMealTypes(householdId: string, mealTypes: MealType[]): Promise<void> {
  const { error } = await supabase
    .from('households')
    .update({ meal_types: mealTypes })
    .eq('id', householdId)
  if (error) throw error
}

/** Creates a household and makes the current user its first (owner) member. */
export async function createHousehold(name: string): Promise<Household> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not signed in')

  const { data: household, error } = await supabase
    .from('households')
    .insert({ name, created_by: user.id })
    .select(HOUSEHOLD_COLUMNS)
    .single()
  if (error) throw error

  const { error: memberError } = await supabase
    .from('household_members')
    .insert({ household_id: household.id, user_id: user.id, role: 'owner' })
  if (memberError) throw memberError

  return household
}

