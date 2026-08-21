import { describe, it, expect } from 'vitest'
import { matchUsedIngredients } from './matchIngredients'

describe('matchUsedIngredients', () => {
  it('matches pantry items whose name equals a used ingredient, case/space-insensitively', () => {
    const pantry = [
      { id: '1', name: 'Milk' },
      { id: '2', name: 'Eggs' },
      { id: '3', name: 'Butter' },
    ]
    expect(matchUsedIngredients(pantry, ['milk', ' EGGS '])).toEqual(['1', '2'])
  })

  it('ignores used names that have no matching pantry item', () => {
    const pantry = [{ id: '1', name: 'Flour' }]
    expect(matchUsedIngredients(pantry, ['sugar'])).toEqual([])
  })

  it('matches Hebrew names exactly (no cross-language matching attempted)', () => {
    const pantry = [{ id: '1', name: 'עגבניות' }]
    expect(matchUsedIngredients(pantry, ['עגבניות'])).toEqual(['1'])
  })

  it('returns nothing when the pantry is empty', () => {
    expect(matchUsedIngredients([], ['milk'])).toEqual([])
  })
})
