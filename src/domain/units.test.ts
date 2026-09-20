import { describe, it, expect } from 'vitest'
import { convertQuantity, formatQuantity, sameUnitGroup } from './units'

describe('sameUnitGroup', () => {
  it('groups weight units together and volume units together', () => {
    expect(sameUnitGroup('g', 'kg')).toBe(true)
    expect(sameUnitGroup('ml', 'l')).toBe(true)
  })

  it('does not group across weight/volume/count', () => {
    expect(sameUnitGroup('g', 'ml')).toBe(false)
    expect(sameUnitGroup('count', 'g')).toBe(false)
  })
})

describe('convertQuantity', () => {
  it('converts within the weight group', () => {
    expect(convertQuantity(1, 'kg', 'g')).toBe(1000)
    expect(convertQuantity(500, 'g', 'kg')).toBe(0.5)
  })

  it('converts within the volume group', () => {
    expect(convertQuantity(1.5, 'l', 'ml')).toBe(1500)
  })

  it('returns null across incompatible groups', () => {
    expect(convertQuantity(1, 'kg', 'ml')).toBeNull()
    expect(convertQuantity(1, 'count', 'g')).toBeNull()
  })
})

describe('formatQuantity', () => {
  it('shows a plain count with a × prefix, ignoring the unit label', () => {
    expect(formatQuantity(2, 'count', 'Count')).toBe('×2')
  })

  it('shows the given unit label and trims trailing zeros', () => {
    expect(formatQuantity(0.5, 'kg', 'kg')).toBe('0.5 kg')
    expect(formatQuantity(500, 'g', 'גרם')).toBe('500 גרם')
  })
})
