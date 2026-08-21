import { supabase } from '@/shared/supabase'

export type ShoppingItem = {
  id: string
  household_id: string
  name: string
  quantity: number | null
  unit: string | null
  status: 'pending' | 'purchased'
  added_by: string | null
  purchased_at: string | null
  created_at: string
}

export async function listShoppingItems(householdId: string): Promise<ShoppingItem[]> {
  const { data, error } = await supabase
    .from('shopping_items')
    .select('*')
    .eq('household_id', householdId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

/** Free text only — quantity/unit are deliberately not asked for up front. See CLAUDE.md. */
export async function addShoppingItem(householdId: string, name: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { error } = await supabase.from('shopping_items').insert({
    household_id: householdId,
    name: name.trim(),
    added_by: user?.id ?? null,
  })
  if (error) throw error
}

export async function setShoppingItemStatus(
  id: string,
  status: ShoppingItem['status'],
): Promise<void> {
  const { error } = await supabase
    .from('shopping_items')
    .update({ status, purchased_at: status === 'purchased' ? new Date().toISOString() : null })
    .eq('id', id)
  if (error) throw error
}
