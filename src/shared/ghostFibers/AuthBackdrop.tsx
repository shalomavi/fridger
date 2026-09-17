import type { ReactNode } from 'react'
import { useTheme } from '@/shared/useTheme'
import GhostFibers from './GhostFibers'

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

/** Full-screen shader backdrop shared by the pre-household screens (login,
 * household setup) — the only two views a user sees before either exists. */
export function AuthBackdrop({ children }: { children: ReactNode }) {
  const { theme } = useTheme()
  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-app p-6 font-ui-en">
      <GhostFibers className="absolute inset-0" lightMode={theme === 'light'} {...fiberColors[theme]} />
      {children}
    </div>
  )
}
