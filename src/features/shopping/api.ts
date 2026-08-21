import { supabase } from '@/shared/supabase'
import { purchaseItem } from '@/domain/purchaseItem'
import { isSameIngredient } from '@/domain/normalize'
import { mergeAmount } from '@/domain/mergeAmount'

export type ShoppingItem = {
  id: string
  household_id: string
  name: string
  amount: string | null
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

/** `amount` is free text and optional — no unit picker, no number parsing. See CLAUDE.md. */
export async function addShoppingItem(
  householdId: string,
  name: string,
  amount?: string,
): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { error } = await supabase.from('shopping_items').insert({
    household_id: householdId,
    name: name.trim(),
    amount: amount?.trim() || null,
    added_by: user?.id ?? null,
  })
  if (error) throw error
}

export async function updateShoppingItemAmount(id: string, amount: string | null): Promise<void> {
  const { error } = await supabase.from('shopping_items').update({ amount }).eq('id', id)
  if (error) throw error
}

/**
 * The shopping -> pantry transition (§1/§3 of the plan): the shopping row is
 * kept, marked purchased, for history — a new pantry row is created rather
 * than the old one being moved. If an available pantry row for the same
 * ingredient already exists (you still had some milk and bought more), the
 * amounts merge into that row instead of creating a second "Milk" entry —
 * see domain/mergeAmount.ts.
 *
 * Known limitation: undoPurchase can only find a pantry row it created
 * itself (matched by source_item_id). A mis-tap undo after a merge leaves
 * the merged amount in the pantry rather than un-merging it — reversing a
 * text join isn't well-defined, and this is a rare enough case (undo right
 * after a merge-on-purchase) that it's not worth solving.
 */
export async function markPurchased(item: ShoppingItem): Promise<void> {
  const { data: available } = await supabase
    .from('pantry_items')
    .select('id, name, amount')
    .eq('household_id', item.household_id)
    .eq('status', 'available')
  const match = (available ?? []).find((p) => isSameIngredient(p.name, item.name))

  if (match) {
    const { error } = await supabase
      .from('pantry_items')
      .update({ amount: mergeAmount(match.amount, item.amount) })
      .eq('id', match.id)
    if (error) throw error
  } else {
    const { error: pantryError } = await supabase.from('pantry_items').insert(purchaseItem(item))
    if (pantryError) throw pantryError
  }

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
