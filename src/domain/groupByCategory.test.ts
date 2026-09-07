import { describe, it, expect } from 'vitest'
import { groupByCategory } from './groupByCategory'

type Item = { name: string; category: string | null }

describe('groupByCategory', () => {
  it('buckets items in the given order, dropping empty categories', () => {
    const items: Item[] = [
      { name: 'Milk', category: 'dairy' },
      { name: 'Apples', category: 'produce' },
      { name: 'Cheese', category: 'dairy' },
    ]

    const groups = groupByCategory(items, ['produce', 'dairy', 'meat'])

    expect(groups).toEqual([
      { category: 'produce', items: [items[1]] },
      { category: 'dairy', items: [items[0], items[2]] },
    ])
  })

  it('puts uncategorized items (null, or not in the order list) in one trailing group', () => {
    const items: Item[] = [
      { name: 'Mystery item', category: null },
      { name: 'Milk', category: 'dairy' },
      { name: 'Old category', category: 'discontinued' },
    ]

    const groups = groupByCategory(items, ['dairy'])

    expect(groups).toEqual([
      { category: 'dairy', items: [items[1]] },
      { category: null, items: [items[0], items[2]] },
    ])
  })

  it('returns nothing for an empty list', () => {
    expect(groupByCategory([], ['dairy', 'produce'])).toEqual([])
  })
})
