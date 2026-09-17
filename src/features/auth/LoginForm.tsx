import { useState, type FormEvent } from 'react'
import { supabase } from '@/shared/supabase'
import { Button } from '@/shared/ui/Button'
import { statusTextClass } from '@/shared/ui/Badge'
import { useTheme } from '@/shared/useTheme'
import GhostFibers from '@/shared/ghostFibers/GhostFibers'

type Mode = 'signin' | 'signup'

// Colors read live from the theme tokens (src/index.css) via GhostFibers'
// setColor, so they follow --color-primary/--color-primary-accent
// automatically instead of duplicating hex here. Per-theme tuning below is
// otherwise independent of color: GhostFibers renders light mode as
// ink-on-paper rather than glow-on-dark (see fragment shader's uLightMode
// branch), and dark mode dials blueBoost/brightness/glowIntensity down from
// the component's defaults (tuned for a low-green indigo palette) — left at
// their defaults, --color-primary-accent's teal read as saturated cyan.
const fiberColors = {
  light: {
    lineColor: 'var(--color-primary)',
    glowColor: 'var(--color-primary-accent)',
    backdropColor: 'var(--color-emerald-50)',
    brightness: 3,
    glowIntensity: 1,
    glowFalloff: 4,
    layers: 10,
    lineSharpness: 5,
    scale: 1.1
  },
  dark: {
    lineColor: 'var(--color-primary)',
    glowColor: 'var(--color-primary-accent)',
    blueBoost: 1,
    brightness: 0.7,
    glowIntensity: 0.5
  }
} as const

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
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-app p-6 font-ui-en">
      <GhostFibers className="absolute inset-0" lightMode={theme === 'light'} {...fiberColors[theme]} />
      <form onSubmit={onSubmit} className="relative w-full max-w-sm space-y-4">
        <h1 className="text-center text-3xl font-semibold text-primary-accent">Fridger</h1>

        <input
          type="email"
          required
          autoComplete="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg bg-surface/15 px-4 py-3 text-text outline-none ring-1 ring-inset ring-surface-muted/60 backdrop-blur-lg focus:ring-2 focus:ring-primary"
        />
        <input
          type="password"
          required
          minLength={6}
          autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg bg-surface/15 px-4 py-3 text-text outline-none ring-1 ring-inset ring-surface-muted/60 backdrop-blur-lg focus:ring-2 focus:ring-primary"
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
    </div>
  )
}
