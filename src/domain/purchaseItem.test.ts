import { describe, it, expect } from 'vitest'
import { purchaseItem } from './purchaseItem'

describe('purchaseItem', () => {
  it('carries name and amount through to the pantry row', () => {
    const pantryItem = purchaseItem({
      id: 'shop-1',
      household_id: 'house-1',
      name: 'Milk',
      amount: '1L',
    })

    expect(pantryItem).toEqual({
      household_id: 'house-1',
      name: 'Milk',
      amount: '1L',
      source_item_id: 'shop-1',
      status: 'available',
    })
  })

  it('allows a null amount — half of a real list has none', () => {
    const pantryItem = purchaseItem({
      id: 'shop-2',
      household_id: 'house-1',
      name: 'Bread',
      amount: null,
    })

    expect(pantryItem.amount).toBeNull()
  })

  it('links back to the shopping item it came from, so undo can find it', () => {
    const pantryItem = purchaseItem({
      id: 'shop-3',
      household_id: 'house-1',
      name: 'Eggs',
      amount: '1 dozen',
    })

    expect(pantryItem.source_item_id).toBe('shop-3')
  })
})
