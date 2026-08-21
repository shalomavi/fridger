import { describe, it, expect } from 'vitest'
import { purchaseItem } from './purchaseItem'

describe('purchaseItem', () => {
  it('carries name, quantity, and unit through to the pantry row', () => {
    const pantryItem = purchaseItem({
      id: 'shop-1',
      household_id: 'house-1',
      name: 'Milk',
      quantity: 1,
      unit: 'L',
    })

    expect(pantryItem).toEqual({
      household_id: 'house-1',
      name: 'Milk',
      quantity: 1,
      unit: 'L',
      source_item_id: 'shop-1',
      status: 'available',
    })
  })

  it('allows a null quantity/unit — half of a real list has neither', () => {
    const pantryItem = purchaseItem({
      id: 'shop-2',
      household_id: 'house-1',
      name: 'Bread',
      quantity: null,
      unit: null,
    })

    expect(pantryItem.quantity).toBeNull()
    expect(pantryItem.unit).toBeNull()
  })

  it('links back to the shopping item it came from, so undo can find it', () => {
    const pantryItem = purchaseItem({
      id: 'shop-3',
      household_id: 'house-1',
      name: 'Eggs',
      quantity: 12,
      unit: null,
    })

    expect(pantryItem.source_item_id).toBe('shop-3')
  })
})
