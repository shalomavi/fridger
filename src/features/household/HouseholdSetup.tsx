import { useState } from 'react'
import { createHousehold, joinHousehold } from './api'
import { useInvalidateHousehold } from './useHousehold'

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
      setError(e instanceof Error ? e.message : 'Something went wrong')
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
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-slate-900 p-6">
      <div className="w-full max-w-sm space-y-4 text-slate-100">
        <h1 className="text-center text-2xl font-semibold text-teal-400">
          Set up your household
        </h1>

        {mode === 'choose' && (
          <div className="space-y-3">
            <button
              onClick={() => setMode('create')}
              className="w-full rounded-lg bg-teal-600 py-3 font-medium text-white"
            >
              Start a new household
            </button>
            <button
              onClick={() => setMode('join')}
              className="w-full rounded-lg bg-slate-800 py-3 font-medium text-slate-100"
            >
              I have an invite code
            </button>
          </div>
        )}

        {mode === 'create' && (
          <div className="space-y-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Household name"
              className="w-full rounded-lg bg-slate-800 px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button
              onClick={submitCreate}
              disabled={busy}
              className="w-full rounded-lg bg-teal-600 py-3 font-medium text-white disabled:opacity-50"
            >
              {busy ? '…' : 'Create'}
            </button>
          </div>
        )}

        {mode === 'join' && (
          <div className="space-y-3">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Invite code"
              autoCapitalize="characters"
              className="w-full rounded-lg bg-slate-800 px-4 py-3 uppercase outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button
              onClick={submitJoin}
              disabled={busy || !code.trim()}
              className="w-full rounded-lg bg-teal-600 py-3 font-medium text-white disabled:opacity-50"
            >
              {busy ? '…' : 'Join'}
            </button>
          </div>
        )}

        {mode !== 'choose' && (
          <button onClick={() => setMode('choose')} className="w-full text-sm text-slate-400">
            Back
          </button>
        )}

        {error && <p className="text-sm text-rose-400">{error}</p>}
      </div>
    </div>
  )
}
