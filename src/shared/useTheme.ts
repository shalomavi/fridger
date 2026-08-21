import { useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'fridger-theme'

function readStoredTheme(): Theme | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === 'light' || stored === 'dark' ? stored : null
  } catch {
    return null
  }
}

function systemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

// Personal, per-device preference — deliberately not synced through the
// household (unlike language). Defaults to the OS/browser preference until
// the user picks explicitly; index.html applies a stored choice before
// first paint to avoid a flash of the wrong theme.
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => readStoredTheme() ?? systemTheme())

  useEffect(() => {
    if (readStoredTheme()) return
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => setThemeState(systemTheme())
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  function setTheme(next: Theme) {
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // localStorage unavailable (private mode, etc.) — theme still applies
      // for this session, just won't persist across reloads.
    }
    setThemeState(next)
  }

  return { theme, setTheme }
}
