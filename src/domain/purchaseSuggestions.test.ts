import { describe, it, expect } from 'vitest'
import { purchaseSuggestions } from './purchaseSuggestions'

describe('purchaseSuggestions', () => {
  it('lists purchased items, most recent first', () => {
    const items = [
      { name: 'Milk', status: 'purchased', purchased_at: '2026-09-01T00:00:00Z' },
      { name: 'Eggs', status: 'purchased', purchased_at: '2026-09-10T00:00:00Z' },
    ]
    expect(purchaseSuggestions(items)).toEqual(['Eggs', 'Milk'])
  })

  it('ignores pending items', () => {
    const items = [
      { name: 'Milk', status: 'purchased', purchased_at: '2026-09-01T00:00:00Z' },
      { name: 'Bread', status: 'pending', purchased_at: null },
    ]
    expect(purchaseSuggestions(items)).toEqual(['Milk'])
  })

  it('dedupes by normalized name, keeping the most recent casing', () => {
    const items = [
      { name: 'milk', status: 'purchased', purchased_at: '2026-09-01T00:00:00Z' },
      { name: 'Milk', status: 'purchased', purchased_at: '2026-09-10T00:00:00Z' },
    ]
    expect(purchaseSuggestions(items)).toEqual(['Milk'])
  })
})
