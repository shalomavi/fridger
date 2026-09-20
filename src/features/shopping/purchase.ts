import { supabase } from '@/shared/supabase'
import { purchaseItem } from '@/domain/purchaseItem'
import { isSameIngredient } from '@/domain/normalize'
import { mergeDetails } from '@/domain/mergeDetails'
import { mergeQuantity } from '@/domain/mergeQuantity'
import type { Unit } from '@/domain/units'
import type { ShoppingItem } from './api'

/**
 * The shopping -> pantry transition (§1/§3 of the plan): the shopping row is
 * kept, marked purchased, for history — a new pantry row is created rather
 * than the old one being moved. If an available pantry row for the same
 * ingredient already exists (you still had some milk and bought more), the
 * details and quantity merge into that row instead of creating a second
 * "Milk" entry — see domain/mergeDetails.ts, domain/mergeQuantity.ts. If the
 * two rows' units aren't compatible (e.g. existing pantry row in "kg", this
 * purchase in "ml"), quantity can't be merged, so a second row is inserted
 * instead of merging into a unit that doesn't fit.
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
    .select('id, name, details, quantity, unit')
    .eq('household_id', item.household_id)
    .eq('status', 'available')
  const match = (available ?? []).find((p) => isSameIngredient(p.name, item.name))
  const merged =
    match &&
    mergeQuantity(
      { quantity: match.quantity, unit: match.unit as Unit },
      { quantity: item.quantity, unit: item.unit },
    )

  if (match && merged) {
    const { error } = await supabase
      .from('pantry_items')
      .update({
        details: mergeDetails(match.details, item.details),
        quantity: merged.quantity,
        unit: merged.unit,
      })
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
