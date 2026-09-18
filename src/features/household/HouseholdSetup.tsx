import { useState } from 'react'
import { createHousehold } from './api'
import { createInvite, joinHousehold } from './invites'
import { useInvalidateHousehold } from './useHousehold'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Surface } from '@/shared/ui/Surface'
import { statusTextClass } from '@/shared/ui/Badge'
import { AuthBackdrop } from '@/shared/ghostFibers/AuthBackdrop'
import { useTheme } from '@/shared/useTheme'
import { titleTextClass, titleGlow } from '@/shared/ui/titleGlow'

// PostgrestError isn't `instanceof Error`, so pull its message out explicitly
// rather than falling back to a generic string that hides the real cause.
function describeError(e: unknown): string {
  console.error('HouseholdSetup error:', e)
  if (e instanceof Error) return e.message
  if (e && typeof e === 'object') {
    const anyE = e as Record<string, unknown>
    return String(anyE.message ?? anyE.error_description ?? anyE.hint ?? JSON.stringify(e))
  }
  return String(e)
}

/** Shown once, to whichever of the two users signs up first (create) and
 * second (join with the code the first user shares). */
export function HouseholdSetup() {
  const { theme } = useTheme()
  const [mode, setMode] = useState<'choose' | 'create' | 'join' | 'invite'>('choose')
  const [name, setName] = useState('Our household')
  const [code, setCode] = useState('')
  const [inviteCode, setInviteCode] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const invalidate = useInvalidateHousehold()

  // The creator is the only one guaranteed to see this screen — show the
  // invite code here rather than relying on them to find it later in
  // Settings, or the second household member may never get invited.
  async function submitCreate() {
    setBusy(true)
    setError(null)
    try {
      const household = await createHousehold(name.trim() || 'Our household')
      setInviteCode(await createInvite(household.id))
      setMode('invite')
    } catch (e) {
      setError(describeError(e))
    } finally {
      setBusy(false)
    }
  }

  async function submitJoin() {
    setBusy(true)
    setError(null)
    try {
      await joinHousehold(code)
      invalidate()
    } catch (e) {
      setError(describeError(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthBackdrop>
      <div className="relative w-full max-w-sm space-y-4 text-text">
        <h1 className={`text-center text-2xl font-semibold ${titleTextClass[theme]} ${titleGlow[theme]}`}>
          Set up your household
        </h1>

        {mode === 'choose' && (
          <div className="space-y-3">
            <Button onClick={() => setMode('create')} className="w-full py-3">
              Start a new household
            </Button>
            <Button variant="secondary" onClick={() => setMode('join')} className="w-full py-3">
              I have an invite code
            </Button>
          </div>
        )}

        {mode === 'create' && (
          <div className="space-y-3">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Household name"
              className="w-full px-4 py-3"
            />
            <Button onClick={submitCreate} disabled={busy} className="w-full py-3">
              {busy ? '…' : 'Create'}
            </Button>
          </div>
        )}

        {mode === 'invite' && inviteCode && (
          <div className="space-y-3">
            <Surface className="px-4 py-3 text-center">
              <p className="text-xs text-text-muted">Share this code with your partner</p>
              <p className="text-2xl font-mono tracking-widest text-primary-accent">{inviteCode}</p>
            </Surface>
            <Button onClick={invalidate} className="w-full py-3">
              Continue
            </Button>
          </div>
        )}

        {mode === 'join' && (
          <div className="space-y-3">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Invite code"
              autoCapitalize="characters"
              className="w-full px-4 py-3 uppercase"
            />
            <Button onClick={submitJoin} disabled={busy || !code.trim()} className="w-full py-3">
              {busy ? '…' : 'Join'}
            </Button>
          </div>
        )}

        {mode !== 'choose' && mode !== 'invite' && (
          <button onClick={() => setMode('choose')} className="w-full text-sm text-text-muted">
            Back
          </button>
        )}

        {error && <p className={`text-sm ${statusTextClass('danger')}`}>{error}</p>}
      </div>
    </AuthBackdrop>
  )
}
