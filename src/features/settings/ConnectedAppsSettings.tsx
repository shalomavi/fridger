import type { ConnectedApp } from './connectedApps'
import { useConnectedApps } from './useConnectedApps'
import { useHousehold } from '@/features/household/useHousehold'
import { useLanguage } from '@/features/household/useLanguage'
import { useConfirm } from '@/shared/alerts/ConfirmContext'
import { UnlinkIcon } from '@/shared/ui/FormIcons'

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
  const confirm = useConfirm()
  if (apps.length === 0) return <p className="text-xs text-text-muted">{t('connectedAppsNone')}</p>

  const handleDisconnect = async (id: string) => {
    const confirmed = await confirm({
      message: t('connectedAppsConfirmDisconnect'),
      confirmLabel: t('connectedAppsDisconnect'),
      cancelLabel: t('cancel'),
      destructive: true,
    })
    if (confirmed) onRevoke(id)
  }

  return (
    <ul className="space-y-1">
      {apps.map((app) => (
        <li key={app.id} className="flex items-center justify-between text-sm">
          <span>{app.clientName}</span>
          <button
            onClick={() => handleDisconnect(app.id)}
            aria-label={t('connectedAppsDisconnect')}
            className="flex-none p-1 text-danger transition-transform duration-300 active:scale-95"
          >
            <UnlinkIcon />
          </button>
        </li>
      ))}
    </ul>
  )
}
