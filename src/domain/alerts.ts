import { daysUntil, isExpiringSoon } from './expiry'

export type AlertSeverity = 'warning' | 'danger'

/**
 * Alert types are a discriminated union on `type` — add a new type here,
 * write a detector for it below, and push that detector into `detectors`.
 * Nothing else (UI included) needs to change its shape to notice it; only
 * the switch that renders a message per type (see AlertBanner) needs a
 * new case.
 */
export type PantryAlert = {
  id: string
  type: 'expiring-soon'
  severity: AlertSeverity
  itemId: string
  itemName: string
  daysUntil: number
}

type AlertSourceItem = { id: string; name: string; expires_at: string | null }
type Detector = (items: AlertSourceItem[], now: Date) => PantryAlert[]

function detectExpiringSoon(items: AlertSourceItem[], now: Date): PantryAlert[] {
  return items
    .filter((item) => isExpiringSoon(item.expires_at, now))
    .map((item) => {
      const days = daysUntil(item.expires_at!, now)
      return {
        id: `expiring-soon:${item.id}`,
        type: 'expiring-soon',
        severity: days < 0 ? 'danger' : 'warning',
        itemId: item.id,
        itemName: item.name,
        daysUntil: days,
      }
    })
}

const detectors: Detector[] = [detectExpiringSoon]

export function collectPantryAlerts(items: AlertSourceItem[], now: Date = new Date()): PantryAlert[] {
  return detectors.flatMap((detect) => detect(items, now))
}
