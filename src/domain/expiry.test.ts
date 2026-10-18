import { describe, it, expect } from 'vitest'
import { defaultExpiry, isExpiringSoon, daysUntil, toDateInputValue, formatDateDisplay } from './expiry'

const NOW = new Date('2026-08-21T12:00:00Z')

describe('isExpiringSoon', () => {
  it('is false when there is no expiry date', () => {
    expect(isExpiringSoon(null, NOW)).toBe(false)
  })

  it('is true within the next 3 days', () => {
    expect(isExpiringSoon('2026-08-23', NOW)).toBe(true)
  })

  it('is true for something already expired', () => {
    expect(isExpiringSoon('2026-08-19', NOW)).toBe(true)
  })

  it('is false further out than the threshold', () => {
    expect(isExpiringSoon('2026-09-01', NOW)).toBe(false)
  })
})

describe('daysUntil', () => {
  it('counts whole days forward', () => {
    expect(daysUntil('2026-08-24T12:00:00Z', NOW)).toBe(3)
  })

  it('is negative once past', () => {
    expect(daysUntil('2026-08-19T12:00:00Z', NOW)).toBe(-2)
  })
})

describe('toDateInputValue', () => {
  it('passes a plain date through unchanged', () => {
    expect(toDateInputValue('2026-09-01')).toBe('2026-09-01')
  })

  it('strips the time/offset off a full Postgres timestamptz string', () => {
    expect(toDateInputValue('2026-09-01T00:00:00+00:00')).toBe('2026-09-01')
  })

  it('is empty for null', () => {
    expect(toDateInputValue(null)).toBe('')
  })
})

describe('formatDateDisplay', () => {
  it('formats as dd/mm/yyyy', () => {
    expect(formatDateDisplay('2026-09-01')).toBe('01/09/2026')
  })

  it('handles a full timestamptz string the same way', () => {
    expect(formatDateDisplay('2026-09-01T00:00:00+00:00')).toBe('01/09/2026')
  })
})

describe('defaultExpiry', () => {
  const now = new Date(2026, 9, 28, 12)

  it('adds the household days to today for produce', () => {
    expect(defaultExpiry('produce', 7, now)).toBe('2026-11-04')
  })

  it('gives nothing to other categories or uncategorised items', () => {
    expect(defaultExpiry('dairy', 7, now)).toBeNull()
    expect(defaultExpiry(null, 7, now)).toBeNull()
  })

  it('is off when days is 0', () => {
    expect(defaultExpiry('produce', 0, now)).toBeNull()
  })
})
