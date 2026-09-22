import { useState } from 'react'
import type { McpToken } from './mcpTokens'
import { useMcpTokens } from './useMcpTokens'
import { useHousehold } from '@/features/household/useHousehold'
import { useLanguage } from '@/features/household/useLanguage'
import { useConfirm } from '@/shared/alerts/ConfirmContext'
import { useToast } from '@/shared/alerts/ToastContext'
import { Surface } from '@/shared/ui/Surface'
import { Input } from '@/shared/ui/Input'
import { TrashIcon } from '@/shared/ui/FormIcons'
// Same glass treatment as Input's fieldClass, but with bg-primary in place
// of bg-surface/5 (fieldClass's background is baked into one literal
// string, so it can't be safely overridden by appending another bg-*
// utility) and a darker shadow so it still reads against the solid fill.
const primaryFieldShadow =
  'shadow-[inset_0_-2px_3px_0_rgba(0,0,0,0.55),0_2px_5px_2px_rgba(0,0,0,0.4),0_10px_24px_6px_rgba(0,0,0,0.45)]'
const primaryFieldFocusShadow =
  'focus:shadow-[inset_0_-2px_3px_0_rgba(0,0,0,0.55),0_2px_5px_2px_rgba(0,0,0,0.4),0_10px_24px_6px_rgba(0,0,0,0.45),0_0_0_2px_var(--color-primary)]'
const primaryFieldClass =
  `rounded-lg bg-primary text-white outline-none ${primaryFieldShadow} backdrop-blur-sm backdrop-saturate-150 ${primaryFieldFocusShadow}`

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
        <Input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder={t('mcpTokenLabelPlaceholder')}
          className="h-12 flex-1 px-4"
        />
        <button
          onClick={() => generate.mutate(label, { onSuccess: () => setLabel('') })}
          disabled={generate.isPending}
          className={`flex h-12 flex-none items-center justify-center px-3 text-sm font-medium transition-transform duration-300 active:scale-95 disabled:opacity-50 ${primaryFieldClass}`}
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
  const confirm = useConfirm()
  const active = tokens.filter((token) => !token.revoked_at)
  if (active.length === 0) return <p className="text-xs text-text-muted">{t('mcpNoTokens')}</p>

  const handleRevoke = async (id: string) => {
    const confirmed = await confirm({
      message: t('mcpConfirmRevoke'),
      confirmLabel: t('mcpRevoke'),
      cancelLabel: t('cancel'),
      destructive: true,
    })
    if (confirmed) onRevoke(id)
  }

  return (
    <ul className="space-y-1">
      {active.map((token) => (
        <li key={token.id} className="flex items-center justify-between text-sm">
          <span>{token.label}</span>
          <button
            onClick={() => handleRevoke(token.id)}
            aria-label={t('mcpRevoke')}
            className="flex-none p-1 text-danger transition-transform duration-300 active:scale-95"
          >
            <TrashIcon />
          </button>
        </li>
      ))}
    </ul>
  )
}
