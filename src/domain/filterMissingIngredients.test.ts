import { describe, it, expect } from 'vitest'
import { filterMissingIngredients } from './filterMissingIngredients'

describe('filterMissingIngredients', () => {
  it('drops missing ingredients already tracked, case/space-insensitively', () => {
    const missing = [
      { name: 'Milk', quantity: 1, unit: 'count' as const, category: 'dairy' as const },
      { name: ' EGGS ', quantity: 2, unit: 'count' as const, category: 'dairy' as const },
    ]
    expect(filterMissingIngredients(missing, [{ name: 'milk' }])).toEqual([missing[1]])
  })

  it('keeps everything when nothing is tracked yet', () => {
    const missing = [{ name: 'Flour', quantity: 1, unit: 'count' as const, category: 'pantry' as const }]
    expect(filterMissingIngredients(missing, [])).toEqual(missing)
  })

  it('checks against both pantry and shopping-list rows together', () => {
    const missing = [
      { name: 'Bread', quantity: 1, unit: 'count' as const, category: 'bakery' as const },
      { name: 'Cheese', quantity: 1, unit: 'count' as const, category: 'dairy' as const },
    ]
    expect(filterMissingIngredients(missing, [{ name: 'bread' }, { name: 'butter' }])).toEqual([missing[1]])
  })

  it('matches Hebrew names exactly (no cross-language matching attempted)', () => {
    const missing = [{ name: 'עגבניות', quantity: 1, unit: 'count' as const, category: 'produce' as const }]
    expect(filterMissingIngredients(missing, [{ name: 'עגבניות' }])).toEqual([])
  })
})
