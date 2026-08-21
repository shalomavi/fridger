import { supabase } from '@/shared/supabase'
import { purchaseItem } from '@/domain/purchaseItem'

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

/**
 * The shopping -> pantry transition (§1/§3 of the plan): the shopping row is
 * kept, marked purchased, for history — a new pantry row is created rather
 * than the old one being moved.
 */
export async function markPurchased(item: ShoppingItem): Promise<void> {
  const { error: pantryError } = await supabase.from('pantry_items').insert(purchaseItem(item))
  if (pantryError) throw pantryError

  const { error } = await supabase
    .from('shopping_items')
    .update({ status: 'purchased', purchased_at: new Date().toISOString() })
    .eq('id', item.id)
  if (error) throw error
}

/**
 * Undo a mis-tap. Only removes the pantry row if it's still untouched
 * ('available') — if it's already been consumed, the shopping item stays
 * purchased rather than silently reviving something that's gone.
 */
export async function undoPurchase(item: ShoppingItem): Promise<void> {
  const { error: pantryError } = await supabase
    .from('pantry_items')
    .delete()
    .eq('source_item_id', item.id)
    .eq('status', 'available')
  if (pantryError) throw pantryError

  const { error } = await supabase
    .from('shopping_items')
    .update({ status: 'pending', purchased_at: null })
    .eq('id', item.id)
  if (error) throw error
}
