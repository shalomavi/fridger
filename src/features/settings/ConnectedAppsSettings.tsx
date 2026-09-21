import type { ConnectedApp } from './connectedApps'
import { useConnectedApps } from './useConnectedApps'
import { useHousehold } from '@/features/household/useHousehold'
import { useLanguage } from '@/features/household/useLanguage'

/** Settings section listing apps connected via OAuth (Gemini, and later
 * ChatGPT — see mcp-connector-plan.md §7b/§7c), separate from
 * McpTokenSettings' static-token list since these use a different auth
 * model and have no client-side RLS access. */
export function ConnectedAppsSettings() {
  const { t } = useLanguage()
  const { data: household } = useHousehold()
  const { apps, revoke } = useConnectedApps(household?.id)

  if (!household) return null

  return (
    <div className="space-y-2">
      <p className="text-sm text-text-muted">{t('connectedAppsLabel')}</p>
      <AppList apps={apps.data ?? []} onRevoke={(id) => revoke.mutate(id)} />
    </div>
  )
}

function AppList({ apps, onRevoke }: { apps: ConnectedApp[]; onRevoke: (id: string) => void }) {
  const { t } = useLanguage()
  if (apps.length === 0) return <p className="text-xs text-text-muted">{t('connectedAppsNone')}</p>

  return (
    <ul className="space-y-1">
      {apps.map((app) => (
        <li key={app.id} className="flex items-center justify-between text-sm">
          <span>{app.clientName}</span>
          <button
            onClick={() => confirm(t('connectedAppsConfirmDisconnect')) && onRevoke(app.id)}
            className="text-xs text-red-500 underline"
          >
            {t('connectedAppsDisconnect')}
          </button>
        </li>
      ))}
    </ul>
  )
}
