import { describe, it, expect } from 'vitest'
import { collectPantryAlerts } from './alerts'

const NOW = new Date('2026-08-21T12:00:00Z')

describe('collectPantryAlerts', () => {
  it('is empty when nothing is expiring', () => {
    const items = [{ id: '1', name: 'Rice', expires_at: '2026-09-01' }]
    expect(collectPantryAlerts(items, NOW)).toEqual([])
  })

  it('flags an item expiring within the threshold as a warning', () => {
    const items = [{ id: '1', name: 'Milk', expires_at: '2026-08-23' }]
    const alerts = collectPantryAlerts(items, NOW)
    expect(alerts).toEqual([
      {
        id: 'expiring-soon:1',
        type: 'expiring-soon',
        severity: 'warning',
        itemId: '1',
        itemName: 'Milk',
        daysUntil: 2,
      },
    ])
  })

  it('flags an already-expired item as danger', () => {
    const items = [{ id: '1', name: 'Yogurt', expires_at: '2026-08-19' }]
    const alerts = collectPantryAlerts(items, NOW)
    expect(alerts[0].severity).toBe('danger')
  })

  it('ignores items with no expiry date', () => {
    const items = [{ id: '1', name: 'Flour', expires_at: null }]
    expect(collectPantryAlerts(items, NOW)).toEqual([])
  })
})
