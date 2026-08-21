import { describe, it, expect } from 'vitest'
import { isExpiringSoon, daysUntil } from './expiry'

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
