import { useState } from 'react'
import { createInvite } from './api'
import { useLanguage } from './useLanguage'
import { Surface } from '@/shared/ui/Surface'

/** Generates a fresh invite code on demand and shows it for the partner to type in. */
export function InviteButton({ householdId }: { householdId: string }) {
  const { t } = useLanguage()
  const [code, setCode] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function generate() {
    setBusy(true)
    try {
      setCode(await createInvite(householdId))
    } finally {
      setBusy(false)
    }
  }

  if (code) {
    return (
      <Surface className="px-4 py-3 text-center">
        <p className="text-xs text-text-muted">{t('inviteShareHint')}</p>
        <p className="text-2xl font-mono tracking-widest text-primary-accent">{code}</p>
      </Surface>
    )
  }

  return (
    <button onClick={generate} disabled={busy} className="text-sm text-text-muted underline">
      {busy ? '…' : t('invitePartner')}
    </button>
  )
}
