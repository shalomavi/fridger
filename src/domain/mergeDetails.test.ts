import { describe, it, expect } from 'vitest'
import { mergeDetails } from './mergeDetails'

describe('mergeDetails', () => {
  it('joins two different details with a comma', () => {
    expect(mergeDetails('2', '1kg')).toBe('2, 1kg')
  })

  it('falls back to whichever side has a value', () => {
    expect(mergeDetails(null, '2')).toBe('2')
    expect(mergeDetails('2', null)).toBe('2')
  })

  it('is null when both sides are empty', () => {
    expect(mergeDetails(null, null)).toBeNull()
    expect(mergeDetails('  ', '')).toBeNull()
  })

  it('does not duplicate identical details', () => {
    expect(mergeDetails('2', '2')).toBe('2')
  })

  it('trims whitespace on both sides', () => {
    expect(mergeDetails(' 2 ', ' 1kg ')).toBe('2, 1kg')
  })
})
