import { supabase } from '@/shared/supabase'

export type PantryItem = {
  id: string
  household_id: string
  name: string
  quantity: number | null
  unit: string | null
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
