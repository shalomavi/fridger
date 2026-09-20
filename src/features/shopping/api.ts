import { supabase } from '@/shared/supabase'
import type { Unit } from '@/domain/units'
import type { Category } from '@/shared/categories'

export type ShoppingItem = {
  id: string
  household_id: string
  name: string
  details: string | null
  category: Category | null
  quantity: number
  unit: Unit
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
  quantity = 1,
  unit: Unit = 'count',
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
    quantity,
    unit,
    added_by: user?.id ?? null,
  })
  if (error) throw error
}

export async function updateShoppingItemDetails(id: string, details: string | null): Promise<void> {
  const { error } = await supabase.from('shopping_items').update({ details }).eq('id', id)
  if (error) throw error
}

/** Sets details and quantity+unit together in one round trip — used both
 * for a direct quantity edit and for merging a duplicate add into an
 * existing pending row (see useAddShoppingItem.ts). */
export async function updateShoppingItemDetailsAndQuantity(
  id: string,
  details: string | null,
  quantity: number,
  unit: Unit,
): Promise<void> {
  const { error } = await supabase.from('shopping_items').update({ details, quantity, unit }).eq('id', id)
  if (error) throw error
}

export async function updateShoppingItemQuantity(id: string, quantity: number, unit: Unit): Promise<void> {
  const { error } = await supabase.from('shopping_items').update({ quantity, unit }).eq('id', id)
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
