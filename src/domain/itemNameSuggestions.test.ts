import { describe, it, expect } from 'vitest'
import { itemNameSuggestions } from './itemNameSuggestions'

describe('itemNameSuggestions', () => {
  it('lists distinct names in order of first appearance', () => {
    const items = [{ name: 'Milk' }, { name: 'Eggs' }, { name: 'Bread' }]
    expect(itemNameSuggestions(items)).toEqual(['Milk', 'Eggs', 'Bread'])
  })

  it('dedupes by normalized name, keeping the first casing', () => {
    const items = [{ name: 'Milk' }, { name: 'milk' }]
    expect(itemNameSuggestions(items)).toEqual(['Milk'])
  })
})
