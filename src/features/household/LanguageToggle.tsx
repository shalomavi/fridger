import { useLanguage } from './useLanguage'
import type { Language } from './api'

const OPTIONS: { value: Language; label: string }[] = [
  { value: 'en', label: 'EN' },
  { value: 'he', label: 'עב' },
]

export function LanguageToggle() {
  const { lang, setLanguage } = useLanguage()

  return (
    <div className="flex overflow-hidden rounded-lg border border-surface-muted text-xs">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setLanguage.mutate(opt.value)}
          disabled={setLanguage.isPending}
          className={`px-2 py-1 ${lang === opt.value ? 'bg-primary text-white' : 'text-text-muted'}`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
