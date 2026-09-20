import { describe, it, expect } from 'vitest'
import { mergeQuantity } from './mergeQuantity'

describe('mergeQuantity', () => {
  it('adds two quantities in the same unit', () => {
    expect(mergeQuantity({ quantity: 1, unit: 'count' }, { quantity: 1, unit: 'count' })).toEqual({
      quantity: 2,
      unit: 'count',
    })
  })

  it('converts the incoming quantity into the existing unit before adding', () => {
    expect(mergeQuantity({ quantity: 1, unit: 'kg' }, { quantity: 500, unit: 'g' })).toEqual({
      quantity: 1.5,
      unit: 'kg',
    })
  })

  it('returns null when the units are not compatible', () => {
    expect(mergeQuantity({ quantity: 1, unit: 'kg' }, { quantity: 1, unit: 'ml' })).toBeNull()
    expect(mergeQuantity({ quantity: 1, unit: 'count' }, { quantity: 1, unit: 'g' })).toBeNull()
  })
})
