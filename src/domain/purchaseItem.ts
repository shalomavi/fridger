/**
 * The shopping-list -> pantry transition. Pure: given a shopping item, what
 * pantry row should exist as a result of buying it? No I/O — the caller
 * writes the row. See CLAUDE.md: this is the one boundary that must stay
 * framework-free.
 */

export type PurchasableItem = {
  id: string
  household_id: string
  name: string
  quantity: number | null
  unit: string | null
}

export type NewPantryItem = {
  household_id: string
  name: string
  quantity: number | null
  unit: string | null
  source_item_id: string
  status: 'available'
}

export function purchaseItem(item: PurchasableItem): NewPantryItem {
  return {
    household_id: item.household_id,
    name: item.name,
    quantity: item.quantity,
    unit: item.unit,
    source_item_id: item.id,
    status: 'available',
  }
}
