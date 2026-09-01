import { useTheme, type Theme } from '@/shared/useTheme'

// Icons: Lucide (ISC license, lucide.dev). currentColor lets them inherit
// each button's text color, so no separate light/dark icon variant needed.
function SunIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  )
}

const OPTIONS: { value: Theme; Icon: typeof SunIcon }[] = [
  { value: 'light', Icon: SunIcon },
  { value: 'dark', Icon: MoonIcon },
]

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex overflow-hidden rounded-lg border border-surface-muted text-xs">
      {OPTIONS.map(({ value, Icon }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          aria-label={value}
          className={`flex items-center justify-center px-2 py-1 ${theme === value ? 'bg-primary text-white' : 'bg-surface text-text-muted'}`}
        >
          <Icon />
        </button>
      ))}
    </div>
  )
}
