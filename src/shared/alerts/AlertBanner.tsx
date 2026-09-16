import type { PantryAlert } from '@/domain/alerts'
import { useLanguage } from '@/features/household/useLanguage'
import type { TKey } from '@/shared/i18n'
import { statusTextClass } from '@/shared/ui/Badge'

const severityBg: Record<PantryAlert['severity'], string> = {
  warning: 'bg-warning/10 ring-warning-ring/40',
  danger: 'bg-danger/10 ring-danger/40',
}

/** One line of text per alert type — the only place that needs a new case
 * when `PantryAlert`'s union grows. */
function messageFor(alert: PantryAlert, t: (key: TKey) => string) {
  switch (alert.type) {
    case 'expiring-soon':
      return `${alert.itemName} — ${t('expiringSoon')}`
  }
}

export function AlertBanner({ alerts }: { alerts: PantryAlert[] }) {
  const { t } = useLanguage()
  if (alerts.length === 0) return null

  return (
    <ul className="space-y-1.5">
      {alerts.map((alert) => (
        <li
          key={alert.id}
          className={`rounded-lg px-3 py-2 text-sm ring-1 ring-inset ${severityBg[alert.severity]} ${statusTextClass(alert.severity)}`}
        >
          {messageFor(alert, t)}
        </li>
      ))}
    </ul>
  )
}
