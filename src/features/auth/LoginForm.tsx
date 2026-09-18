import { useState, type FormEvent } from 'react'
import { supabase } from '@/shared/supabase'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { statusTextClass } from '@/shared/ui/Badge'
import { AuthBackdrop } from '@/shared/ghostFibers/AuthBackdrop'
import { useTheme } from '@/shared/useTheme'
import { titleTextClass, titleGlow } from '@/shared/ui/titleGlow'

type Mode = 'signin' | 'signup'

export function LoginForm() {
  const { theme } = useTheme()
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
    <AuthBackdrop>
      <form onSubmit={onSubmit} className="relative w-full max-w-sm space-y-4">
        <h1 className={`text-center text-3xl font-semibold ${titleTextClass[theme]} ${titleGlow[theme]}`}>
          Fridger
        </h1>

        <Input
          type="email"
          required
          autoComplete="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3"
        />
        <Input
          type="password"
          required
          minLength={6}
          autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3"
        />

        {error && <p className={`text-sm ${statusTextClass('danger')}`}>{error}</p>}

        <Button type="submit" disabled={busy} className="w-full py-3">
          {busy ? '…' : mode === 'signin' ? 'Sign in' : 'Create account'}
        </Button>

        <button
          type="button"
          onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          className="w-full text-sm text-text-muted"
        >
          {mode === 'signin' ? 'Need an account?' : 'Already have an account?'}
        </button>
      </form>
    </AuthBackdrop>
  )
}
