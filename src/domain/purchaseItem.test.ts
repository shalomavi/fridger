import { describe, it, expect } from 'vitest'
import { purchaseItem } from './purchaseItem'

describe('purchaseItem', () => {
  it('carries name and details through to the pantry row', () => {
    const pantryItem = purchaseItem({
      id: 'shop-1',
      household_id: 'house-1',
      name: 'Milk',
      details: '1L',
      category: 'dairy',
    })

    expect(pantryItem).toEqual({
      household_id: 'house-1',
      name: 'Milk',
      details: '1L',
      category: 'dairy',
      source_item_id: 'shop-1',
      status: 'available',
    })
  })

  it('allows null details — half of a real list has none', () => {
    const pantryItem = purchaseItem({
      id: 'shop-2',
      household_id: 'house-1',
      name: 'Bread',
      details: null,
      category: null,
    })

    expect(pantryItem.details).toBeNull()
  })

  it('links back to the shopping item it came from, so undo can find it', () => {
    const pantryItem = purchaseItem({
      id: 'shop-3',
      household_id: 'house-1',
      name: 'Eggs',
      details: '1 dozen',
      category: null,
    })

    expect(pantryItem.source_item_id).toBe('shop-3')
  })
})
