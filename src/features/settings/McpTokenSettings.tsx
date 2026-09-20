import { useState } from 'react'
import type { McpToken } from './mcpTokens'
import { useMcpTokens } from './useMcpTokens'
import { useHousehold } from '@/features/household/useHousehold'
import { useLanguage } from '@/features/household/useLanguage'
import { useToast } from '@/shared/alerts/ToastContext'
import { Surface } from '@/shared/ui/Surface'

/** Settings section for connecting an LLM app (Claude, v1) to this
 * household's data via a static bearer token — see mcp-connector-plan.md.
 * Query/mutations live in useMcpTokens.ts to keep this render under the
 * size limit. */
export function McpTokenSettings() {
  const { t } = useLanguage()
  const { data: household } = useHousehold()
  const { tokens, generate, revoke } = useMcpTokens(household?.id)
  const [label, setLabel] = useState('')

  if (!household) return null

  return (
    <div className="space-y-2">
      <p className="text-sm text-text-muted">{t('mcpTokensLabel')}</p>
      <p className="text-xs text-text-muted">{t('mcpTokensHint')}</p>

      {generate.data && <JustCreatedToken token={generate.data} />}

      <div className="flex gap-2">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder={t('mcpTokenLabelPlaceholder')}
          className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm"
        />
        <button
          onClick={() => generate.mutate(label, { onSuccess: () => setLabel('') })}
          disabled={generate.isPending}
          className="rounded-lg bg-primary px-3 py-2 text-sm text-white disabled:opacity-50"
        >
          {t('mcpGenerateToken')}
        </button>
      </div>

      <TokenList tokens={tokens.data ?? []} onRevoke={(id) => revoke.mutate(id)} />
    </div>
  )
}

function JustCreatedToken({ token }: { token: string }) {
  const { t } = useLanguage()
  const { notify } = useToast()
  return (
    <Surface className="space-y-1 px-4 py-3">
      <p className="text-xs text-text-muted">{t('mcpTokenShownOnce')}</p>
      <div className="flex items-center gap-2">
        <code className="flex-1 overflow-x-auto text-xs">{token}</code>
        <button
          onClick={() => {
            navigator.clipboard.writeText(token)
            notify(t('mcpCopied'), 'success')
          }}
          className="text-xs text-primary-accent underline"
        >
          {t('mcpCopyToken')}
        </button>
      </div>
    </Surface>
  )
}

function TokenList({ tokens, onRevoke }: { tokens: McpToken[]; onRevoke: (id: string) => void }) {
  const { t } = useLanguage()
  const active = tokens.filter((token) => !token.revoked_at)
  if (active.length === 0) return <p className="text-xs text-text-muted">{t('mcpNoTokens')}</p>

  return (
    <ul className="space-y-1">
      {active.map((token) => (
        <li key={token.id} className="flex items-center justify-between text-sm">
          <span>{token.label}</span>
          <button
            onClick={() => confirm(t('mcpConfirmRevoke')) && onRevoke(token.id)}
            className="text-xs text-red-500 underline"
          >
            {t('mcpRevoke')}
          </button>
        </li>
      ))}
    </ul>
  )
}
