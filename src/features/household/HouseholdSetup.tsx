import { useState } from 'react'
import { createHousehold, joinHousehold } from './api'
import { useInvalidateHousehold } from './useHousehold'
import { Button } from '@/shared/ui/Button'
import { statusTextClass } from '@/shared/ui/Badge'

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
  const [mode, setMode] = useState<'choose' | 'create' | 'join'>('choose')
  const [name, setName] = useState('Our household')
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const invalidate = useInvalidateHousehold()

  async function submitCreate() {
    setBusy(true)
    setError(null)
    try {
      await createHousehold(name.trim() || 'Our household')
      invalidate()
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
    <div className="flex min-h-dvh items-center justify-center bg-bg p-6 font-ui-en">
      <div className="w-full max-w-sm space-y-4 text-text">
        <h1 className="text-center text-2xl font-semibold text-primary-accent">
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
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Household name"
              className="w-full rounded-lg bg-surface px-4 py-3 outline-none focus:ring-2 focus:ring-primary-ring"
            />
            <Button onClick={submitCreate} disabled={busy} className="w-full py-3">
              {busy ? '…' : 'Create'}
            </Button>
          </div>
        )}

        {mode === 'join' && (
          <div className="space-y-3">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Invite code"
              autoCapitalize="characters"
              className="w-full rounded-lg bg-surface px-4 py-3 uppercase outline-none focus:ring-2 focus:ring-primary-ring"
            />
            <Button onClick={submitJoin} disabled={busy || !code.trim()} className="w-full py-3">
              {busy ? '…' : 'Join'}
            </Button>
          </div>
        )}

        {mode !== 'choose' && (
          <button onClick={() => setMode('choose')} className="w-full text-sm text-text-muted">
            Back
          </button>
        )}

        {error && <p className={`text-sm ${statusTextClass('danger')}`}>{error}</p>}
      </div>
    </div>
  )
}
