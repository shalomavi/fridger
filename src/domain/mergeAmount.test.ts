import { describe, it, expect } from 'vitest'
import { mergeAmount } from './mergeAmount'

describe('mergeAmount', () => {
  it('joins two different amounts with a comma', () => {
    expect(mergeAmount('2', '1kg')).toBe('2, 1kg')
  })

  it('falls back to whichever side has a value', () => {
    expect(mergeAmount(null, '2')).toBe('2')
    expect(mergeAmount('2', null)).toBe('2')
  })

  it('is null when both sides are empty', () => {
    expect(mergeAmount(null, null)).toBeNull()
    expect(mergeAmount('  ', '')).toBeNull()
  })

  it('does not duplicate an identical amount', () => {
    expect(mergeAmount('2', '2')).toBe('2')
  })

  it('trims whitespace on both sides', () => {
    expect(mergeAmount(' 2 ', ' 1kg ')).toBe('2, 1kg')
  })
})
