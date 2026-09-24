import { describe, it, expect } from 'vitest'
import { UNITS, convertQuantity, formatNumber, formatQuantity, sameUnitGroup } from './units'

describe('UNITS', () => {
  it('is the fixed set the rest of the app assumes', () => {
    expect(UNITS).toEqual(['count', 'g', 'kg', 'ml', 'l'])
  })
})

describe('sameUnitGroup', () => {
  it('groups weight units together and volume units together', () => {
    expect(sameUnitGroup('g', 'kg')).toBe(true)
    expect(sameUnitGroup('ml', 'l')).toBe(true)
  })

  it('groups a unit with itself, including count', () => {
    expect(sameUnitGroup('count', 'count')).toBe(true)
    expect(sameUnitGroup('g', 'g')).toBe(true)
  })

  it('does not group across weight/volume/count', () => {
    expect(sameUnitGroup('g', 'ml')).toBe(false)
    expect(sameUnitGroup('count', 'g')).toBe(false)
    expect(sameUnitGroup('count', 'l')).toBe(false)
  })
})

describe('convertQuantity', () => {
  it('converts within the weight group', () => {
    expect(convertQuantity(1, 'kg', 'g')).toBe(1000)
    expect(convertQuantity(500, 'g', 'kg')).toBe(0.5)
  })

  it('converts within the volume group', () => {
    expect(convertQuantity(1.5, 'l', 'ml')).toBe(1500)
    expect(convertQuantity(250, 'ml', 'l')).toBe(0.25)
  })

  it('is a no-op converting a unit to itself', () => {
    expect(convertQuantity(3, 'kg', 'kg')).toBe(3)
    expect(convertQuantity(5, 'count', 'count')).toBe(5)
  })

  it('returns null across incompatible groups', () => {
    expect(convertQuantity(1, 'kg', 'ml')).toBeNull()
    expect(convertQuantity(1, 'count', 'g')).toBeNull()
    expect(convertQuantity(1, 'l', 'count')).toBeNull()
  })
})

describe('formatNumber', () => {
  it('trims to 2 decimal places', () => {
    expect(formatNumber(1.005)).toBe('1')
    expect(formatNumber(0.5001)).toBe('0.5')
  })

  it('drops trailing zeros', () => {
    expect(formatNumber(2)).toBe('2')
    expect(formatNumber(2.0)).toBe('2')
    expect(formatNumber(2.5)).toBe('2.5')
  })
})

describe('formatQuantity', () => {
  it('shows a plain count with a × prefix and a space, ignoring the unit label', () => {
    expect(formatQuantity(2, 'count', 'Count')).toBe('× 2')
    expect(formatQuantity(0.5, 'count', 'Count')).toBe('× 0.5')
  })

  it('shows the given unit label and trims trailing zeros', () => {
    expect(formatQuantity(0.5, 'kg', 'kg')).toBe('0.5 kg')
    expect(formatQuantity(500, 'g', 'גרם')).toBe('500 גרם')
  })

  it('uses whatever unitLabel string it is given verbatim', () => {
    expect(formatQuantity(1.5, 'l', 'ליטר')).toBe('1.5 ליטר')
  })
})
