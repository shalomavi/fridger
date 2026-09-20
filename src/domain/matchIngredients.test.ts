import { describe, it, expect } from 'vitest'
import { matchUsedIngredients } from './matchIngredients'

describe('matchUsedIngredients', () => {
  it('matches pantry items whose name equals a used ingredient, case/space-insensitively', () => {
    const pantry = [
      { id: '1', name: 'Milk', quantity: 2, unit: 'count' as const },
      { id: '2', name: 'Eggs', quantity: 6, unit: 'count' as const },
      { id: '3', name: 'Butter', quantity: 1, unit: 'count' as const },
    ]
    expect(
      matchUsedIngredients(pantry, [
        { name: 'milk', quantity: 1, unit: 'count' },
        { name: ' EGGS ', quantity: 2, unit: 'count' },
      ]),
    ).toEqual([
      { id: '1', remainingQuantity: 1, unit: 'count' },
      { id: '2', remainingQuantity: 4, unit: 'count' },
    ])
  })

  it('ignores used names that have no matching pantry item', () => {
    const pantry = [{ id: '1', name: 'Flour', quantity: 1, unit: 'count' as const }]
    expect(matchUsedIngredients(pantry, [{ name: 'sugar', quantity: 1, unit: 'count' }])).toEqual([])
  })

  it('clamps remaining quantity at 0 instead of going negative when the recipe uses more than is left', () => {
    const pantry = [{ id: '1', name: 'Milk', quantity: 1, unit: 'count' as const }]
    expect(matchUsedIngredients(pantry, [{ name: 'Milk', quantity: 5, unit: 'count' }])).toEqual([
      { id: '1', remainingQuantity: 0, unit: 'count' },
    ])
  })

  it('converts a compatible unit before subtracting (500g used from a 1kg pantry item)', () => {
    const pantry = [{ id: '1', name: 'Cheese', quantity: 1, unit: 'kg' as const }]
    expect(matchUsedIngredients(pantry, [{ name: 'Cheese', quantity: 500, unit: 'g' }])).toEqual([
      { id: '1', remainingQuantity: 0.5, unit: 'kg' },
    ])
  })

  it('does not reduce when the recipe unit is incompatible with the pantry unit', () => {
    const pantry = [{ id: '1', name: 'Cheese', quantity: 1, unit: 'kg' as const }]
    expect(matchUsedIngredients(pantry, [{ name: 'Cheese', quantity: 1, unit: 'ml' }])).toEqual([
      { id: '1', remainingQuantity: 1, unit: 'kg' },
    ])
  })

  it('matches Hebrew names exactly (no cross-language matching attempted)', () => {
    const pantry = [{ id: '1', name: 'עגבניות', quantity: 3, unit: 'count' as const }]
    expect(matchUsedIngredients(pantry, [{ name: 'עגבניות', quantity: 1, unit: 'count' }])).toEqual([
      { id: '1', remainingQuantity: 2, unit: 'count' },
    ])
  })

  it('returns nothing when the pantry is empty', () => {
    expect(matchUsedIngredients([], [{ name: 'milk', quantity: 1, unit: 'count' }])).toEqual([])
  })
})
