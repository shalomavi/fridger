import { supabase } from '@/shared/supabase'
import type { Unit } from '@/domain/units'
import type { Category } from '@/shared/categories'

export type RecipeIngredient = { name: string; quantity: number; unit: Unit; category: Category }
export type RecipeSource = 'suggestion' | 'text' | 'image' | 'url'

export type Recipe = {
  id: string
  household_id: string
  name: string
  ingredients: RecipeIngredient[]
  steps: string[]
  source: RecipeSource
  source_url: string | null
  created_by: string | null
  created_at: string
}

export async function listRecipes(householdId: string): Promise<Recipe[]> {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('household_id', householdId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

/** `id` is supplied by the caller (not left to the column default), same
 * reason as addShoppingItem: lets the optimistic row and the real row share
 * one id, so the swap doesn't change the list `key` and force a remount. */
export async function addRecipe(
  householdId: string,
  id: string,
  name: string,
  ingredients: RecipeIngredient[],
  steps: string[],
  source: RecipeSource,
  sourceUrl?: string,
): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { error } = await supabase.from('recipes').insert({
    id,
    household_id: householdId,
    name,
    ingredients,
    steps,
    source,
    source_url: sourceUrl ?? null,
    created_by: user?.id ?? null,
  })
  if (error) throw error
}

export async function deleteRecipe(id: string): Promise<void> {
  const { error } = await supabase.from('recipes').delete().eq('id', id)
  if (error) throw error
}
