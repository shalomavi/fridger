import { describe, it, expect } from 'vitest'
import { mealToRecipeIngredients } from './mealToRecipe'

describe('mealToRecipeIngredients', () => {
  it('flattens uses and missing into one list', () => {
    const result = mealToRecipeIngredients({
      uses: [{ name: 'Eggs', quantity: 2, unit: 'count' }],
      missing: [{ name: 'Flour', quantity: 200, unit: 'g', category: 'pantry' }],
    })
    expect(result).toEqual([
      { name: 'Eggs', quantity: 2, unit: 'count', category: 'other' },
      { name: 'Flour', quantity: 200, unit: 'g', category: 'pantry' },
    ])
  })

  it('gives every "uses" entry category other, since the model never assigns one to them', () => {
    const result = mealToRecipeIngredients({
      uses: [{ name: 'Rice', quantity: 1, unit: 'kg' }],
      missing: [],
    })
    expect(result).toEqual([{ name: 'Rice', quantity: 1, unit: 'kg', category: 'other' }])
  })

  it('handles a meal with nothing missing', () => {
    expect(mealToRecipeIngredients({ uses: [], missing: [] })).toEqual([])
  })
})
