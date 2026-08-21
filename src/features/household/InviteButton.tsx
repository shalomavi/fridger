import { useState } from 'react'
import { createInvite } from './api'

/** Generates a fresh invite code on demand and shows it for the partner to type in. */
export function InviteButton({ householdId }: { householdId: string }) {
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
      <div className="rounded-lg bg-slate-800 px-4 py-3 text-center">
        <p className="text-xs text-slate-400">Share this code (valid 7 days)</p>
        <p className="text-2xl font-mono tracking-widest text-teal-400">{code}</p>
      </div>
    )
  }

  return (
    <button onClick={generate} disabled={busy} className="text-sm text-slate-400 underline">
      {busy ? '…' : 'Invite your partner'}
    </button>
  )
}
