import { supabase } from '@/shared/supabase'
import { purchaseItem } from '@/domain/purchaseItem'
import { isSameIngredient } from '@/domain/normalize'
import { mergeDetails } from '@/domain/mergeDetails'
import type { Category } from '@/shared/categories'

export type ShoppingItem = {
  id: string
  household_id: string
  name: string
  details: string | null
  category: Category | null
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

/**
 * `details` is free text and optional — no unit picker, no number parsing.
 * See CLAUDE.md. `id` is supplied by the caller (rather than left to the
 * column's default) so the optimistic row in useShoppingList's cache can
 * use that same id — otherwise the optimistic-to-real swap changes the
 * row's id, which changes its list `key` and forces an unmount/remount
 * (visible as a blink, replaying the entrance animation) instead of a
 * seamless update in place.
 */
export async function addShoppingItem(
  householdId: string,
  id: string,
  name: string,
  details?: string,
  category?: Category | null,
): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { error } = await supabase.from('shopping_items').insert({
    id,
    household_id: householdId,
    name: name.trim(),
    details: details?.trim() || null,
    category: category ?? null,
    added_by: user?.id ?? null,
  })
  if (error) throw error
}

export async function updateShoppingItemDetails(id: string, details: string | null): Promise<void> {
  const { error } = await supabase.from('shopping_items').update({ details }).eq('id', id)
  if (error) throw error
}

export async function updateShoppingItemCategory(
  id: string,
  category: Category | null,
): Promise<void> {
  const { error } = await supabase.from('shopping_items').update({ category }).eq('id', id)
  if (error) throw error
}

/** Removes a row outright — unlike markPurchased/undoPurchase this isn't a
 * status transition kept for history, so it's only for mis-added items. */
export async function deleteShoppingItem(id: string): Promise<void> {
  const { error } = await supabase.from('shopping_items').delete().eq('id', id)
  if (error) throw error
}

/** Reverses deleteShoppingItem — the "Undo" toast action, re-inserting the same row. */
export async function restoreShoppingItem(item: ShoppingItem): Promise<void> {
  const { error } = await supabase.from('shopping_items').insert(item)
  if (error) throw error
}

/**
 * The shopping -> pantry transition (§1/§3 of the plan): the shopping row is
 * kept, marked purchased, for history — a new pantry row is created rather
 * than the old one being moved. If an available pantry row for the same
 * ingredient already exists (you still had some milk and bought more), the
 * details merge into that row instead of creating a second "Milk" entry —
 * see domain/mergeDetails.ts.
 *
 * Known limitation: undoPurchase can only find a pantry row it created
 * itself (matched by source_item_id). A mis-tap undo after a merge leaves
 * the merged details in the pantry rather than un-merging it — reversing a
 * text join isn't well-defined, and this is a rare enough case (undo right
 * after a merge-on-purchase) that it's not worth solving.
 */
export async function markPurchased(item: ShoppingItem): Promise<void> {
  const { data: available } = await supabase
    .from('pantry_items')
    .select('id, name, details')
    .eq('household_id', item.household_id)
    .eq('status', 'available')
  const match = (available ?? []).find((p) => isSameIngredient(p.name, item.name))

  if (match) {
    const { error } = await supabase
      .from('pantry_items')
      .update({ details: mergeDetails(match.details, item.details) })
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
