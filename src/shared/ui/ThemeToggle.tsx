import { useTheme, type Theme } from '@/shared/useTheme'

const OPTIONS: { value: Theme; label: string }[] = [
  { value: 'light', label: '☀️' },
  { value: 'dark', label: '🌙' },
]

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex overflow-hidden rounded-lg border border-surface-muted text-xs">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setTheme(opt.value)}
          aria-label={opt.value}
          className={`px-2 py-1 ${theme === opt.value ? 'bg-primary text-white' : 'bg-surface text-text-muted'}`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
