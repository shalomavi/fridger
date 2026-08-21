import { useState, type FormEvent } from 'react'
import { supabase } from '@/shared/supabase'

type Mode = 'signin' | 'signup'

export function LoginForm() {
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)

    const { error } =
      mode === 'signin'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password })

    if (error) setError(error.message)
    setBusy(false)
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-slate-900 p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="text-center text-3xl font-semibold text-teal-400">Fridger</h1>

        <input
          type="email"
          required
          autoComplete="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg bg-slate-800 px-4 py-3 text-slate-100 outline-none focus:ring-2 focus:ring-teal-500"
        />
        <input
          type="password"
          required
          minLength={6}
          autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg bg-slate-800 px-4 py-3 text-slate-100 outline-none focus:ring-2 focus:ring-teal-500"
        />

        {error && <p className="text-sm text-rose-400">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-teal-600 py-3 font-medium text-white disabled:opacity-50"
        >
          {busy ? '…' : mode === 'signin' ? 'Sign in' : 'Create account'}
        </button>

        <button
          type="button"
          onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          className="w-full text-sm text-slate-400"
        >
          {mode === 'signin' ? 'Need an account?' : 'Already have an account?'}
        </button>
      </form>
    </div>
  )
}
