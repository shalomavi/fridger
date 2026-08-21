import { supabase } from '@/shared/supabase'

export type PantryItem = {
  id: string
  household_id: string
  name: string
  amount: string | null
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

export async function updatePantryItemAmount(id: string, amount: string | null): Promise<void> {
  const { error } = await supabase.from('pantry_items').update({ amount }).eq('id', id)
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
