import { useConfirmDialogState } from './ConfirmContext'
import { useLanguage } from '@/features/household/useLanguage'

/** Mounted once, near the root (see main.tsx) — renders whatever confirm()
 * call is currently pending, or nothing. It sits outside Layout (main.tsx),
 * so — unlike most screens — it sets its own `dir`/UI font from the
 * household language instead of inheriting them. */
export function ConfirmDialog() {
  const { pending, respond } = useConfirmDialogState()
  const { lang } = useLanguage()
  if (!pending) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg/5 p-6 backdrop-blur-sm"
      onClick={() => respond(false)}
    >
      <div
        dir={lang === 'he' ? 'rtl' : 'ltr'}
        onClick={(e) => e.stopPropagation()}
        className={`animate-toast-in w-full max-w-sm rounded-lg bg-surface/70 p-4 shadow-lg ring-1 ring-inset ring-surface-muted/60 backdrop-blur-lg ${
          lang === 'he' ? 'font-ui-he' : 'font-ui-en'
        }`}
      >
        <p className="text-base text-text">{pending.message}</p>
        <div className="mt-10 flex justify-end gap-2">
          <button
            onClick={() => respond(false)}
            className="rounded-md bg-surface-muted px-3 py-1.5 text-sm text-text-soft transition-transform duration-300 active:scale-95"
          >
            {pending.cancelLabel}
          </button>
          <button
            onClick={() => respond(true)}
            className={`rounded-md px-3 py-1.5 text-sm text-white transition-transform duration-300 active:scale-95 ${
              pending.destructive ? 'bg-danger-fill' : 'bg-primary'
            }`}
          >
            {pending.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
