import { useLanguage } from './useLanguage'
import type { Language } from './api'

const OPTIONS: { value: Language; label: string }[] = [
  { value: 'en', label: 'EN' },
  { value: 'he', label: 'עב' },
]

export function LanguageToggle() {
  const { lang, setLanguage } = useLanguage()

  return (
    <div className="flex overflow-hidden rounded-lg border border-slate-700 text-xs">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setLanguage.mutate(opt.value)}
          disabled={setLanguage.isPending}
          className={`px-2 py-1 ${lang === opt.value ? 'bg-teal-600 text-white' : 'text-slate-400'}`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
