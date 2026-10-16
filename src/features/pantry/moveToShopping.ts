import { supabase } from '@/shared/supabase'
import {
  addShoppingItem,
  deleteShoppingItem,
  updateShoppingItemDetailsAndQuantity,
  type ShoppingItem,
} from '@/features/shopping/api'
import { isSameIngredient } from '@/domain/normalize'
import { mergeDetails } from '@/domain/mergeDetails'
import { mergeQuantity } from '@/domain/mergeQuantity'
import { sameUnitGroup } from '@/domain/units'
import type { PantryItem } from './api'

/** What Undo needs: the shopping row that was created, or the pre-merge state of the one merged into. */
export type MoveResult = { created: string } | { merged: ShoppingItem }

/**
 * The pantry -> shopping transition: you're running low and want to buy more,
 * which isn't the same as "used" (no consumed history). The pantry row is
 * removed and its name, details, category, quantity and unit go onto the
 * shopping list — merged into an existing pending row for the same
 * ingredient (compatible unit) like useAddShoppingItem does, otherwise as a
 * fresh row.
 */
export async function moveToShoppingList(item: PantryItem): Promise<MoveResult> {
  const { data: pending, error: listError } = await supabase
    .from('shopping_items')
    .select('*')
    .eq('household_id', item.household_id)
    .eq('status', 'pending')
  if (listError) throw listError
  const existing = (pending as ShoppingItem[]).find(
    (i) => isSameIngredient(i.name, item.name) && sameUnitGroup(i.unit, item.unit),
  )

  let result: MoveResult
  if (existing) {
    const merged = mergeQuantity(
      { quantity: existing.quantity, unit: existing.unit },
      { quantity: item.quantity, unit: item.unit },
    )!
    await updateShoppingItemDetailsAndQuantity(
      existing.id,
      mergeDetails(existing.details, item.details),
      merged.quantity,
      merged.unit,
    )
    result = { merged: existing }
  } else {
    const created = crypto.randomUUID()
    await addShoppingItem(
      item.household_id,
      created,
      item.name,
      item.details ?? undefined,
      item.category,
      item.quantity,
      item.unit,
    )
    result = { created }
  }

  const { error } = await supabase.from('pantry_items').delete().eq('id', item.id)
  if (error) {
    await undoShoppingSide(result)
    throw error
  }
  return result
}

function undoShoppingSide(result: MoveResult) {
  return 'created' in result
    ? deleteShoppingItem(result.created)
    : updateShoppingItemDetailsAndQuantity(
        result.merged.id,
        result.merged.details,
        result.merged.quantity,
        result.merged.unit,
      )
}

/** Reverses moveToShoppingList — re-inserts the same pantry row and undoes the shopping side. */
export async function undoMoveToShoppingList(item: PantryItem, result: MoveResult): Promise<void> {
  const { error } = await supabase.from('pantry_items').insert(item)
  if (error) throw error
  await undoShoppingSide(result)
}
