import { supabase } from '@/shared/supabase'
import { addShoppingItem, deleteShoppingItem } from '@/features/shopping/api'
import type { PantryItem } from './api'

/**
 * The pantry -> shopping transition: you're running low and want to buy more,
 * which isn't the same as "used" (no consumed history). The pantry row is
 * removed and a fresh pending shopping row carries its name, details,
 * category, quantity and unit. Returns the new shopping item's id so Undo can
 * reverse it.
 */
export async function moveToShoppingList(item: PantryItem): Promise<string> {
  const shoppingId = crypto.randomUUID()
  await addShoppingItem(
    item.household_id,
    shoppingId,
    item.name,
    item.details ?? undefined,
    item.category,
    item.quantity,
    item.unit,
  )
  const { error } = await supabase.from('pantry_items').delete().eq('id', item.id)
  if (error) {
    await deleteShoppingItem(shoppingId)
    throw error
  }
  return shoppingId
}

/** Reverses moveToShoppingList — re-inserts the same pantry row, drops the shopping one. */
export async function undoMoveToShoppingList(item: PantryItem, shoppingId: string): Promise<void> {
  const { error } = await supabase.from('pantry_items').insert(item)
  if (error) throw error
  await deleteShoppingItem(shoppingId)
}
