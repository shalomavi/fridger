import { supabase } from '@/shared/supabase'
import type { Category } from '@/shared/categories'
import type { Unit } from '@/domain/units'

export type PantryItem = {
  id: string
  household_id: string
  name: string
  details: string | null
  category: Category | null
  quantity: number
  unit: Unit
  status: 'available' | 'consumed'
  added_at: string
  consumed_at: string | null
  expires_at: string | null
  source_item_id: string | null
}

export async function listPantryItems(householdId: string): Promise<PantryItem[]> {
  const { data, error } = await supabase
    .from('pantry_items')
    .select('*')
    .eq('household_id', householdId)
    .eq('status', 'available')
    .order('added_at', { ascending: false })
  if (error) throw error
  return data
}

export async function updatePantryItemDetails(id: string, details: string | null): Promise<void> {
  const { error } = await supabase.from('pantry_items').update({ details }).eq('id', id)
  if (error) throw error
}

export async function updatePantryItemQuantity(id: string, quantity: number, unit: Unit): Promise<void> {
  const { error } = await supabase.from('pantry_items').update({ quantity, unit }).eq('id', id)
  if (error) throw error
}

export async function updatePantryItemCategory(
  id: string,
  category: Category | null,
): Promise<void> {
  const { error } = await supabase.from('pantry_items').update({ category }).eq('id', id)
  if (error) throw error
}

/** `expiresAt` is a date-only string ('2026-09-01') or null to clear it. */
export async function updatePantryItemExpiry(id: string, expiresAt: string | null): Promise<void> {
  const { error } = await supabase
    .from('pantry_items')
    .update({ expires_at: expiresAt })
    .eq('id', id)
  if (error) throw error
}

/** The consume loop (§1 of the plan): what's actually gone stops being listed
 * as if it's still in the fridge. Never deleted — kept for history. */
export async function consumeItem(id: string): Promise<void> {
  const { error } = await supabase
    .from('pantry_items')
    .update({ status: 'consumed', consumed_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

/** Reverses consumeItem — the "Undo" toast action after marking something used. */
export async function undoConsumeItem(id: string): Promise<void> {
  const { error } = await supabase
    .from('pantry_items')
    .update({ status: 'available', consumed_at: null })
    .eq('id', id)
  if (error) throw error
}
