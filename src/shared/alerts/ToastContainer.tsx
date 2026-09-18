import { useToast, TOAST_DURATION_MS, type ToastVariant } from './ToastContext'
import { useLanguage } from '@/features/household/useLanguage'

const variantBarClass: Record<ToastVariant, string> = {
  success: 'bg-primary',
  error: 'bg-danger',
  info: 'bg-primary-accent',
}

/** Mounted once, near the root (see main.tsx) — every useToast().notify()
 * call anywhere in the app renders here. It sits outside Layout, so — like
 * ConfirmDialog — it sets its own dir/UI font from the household language
 * instead of inheriting them.
 *
 * The bottom bar doubles as the dismiss countdown: it's a status-colored
 * strip that fills from nothing to full width over TOAST_DURATION_MS,
 * timed to the same setTimeout that actually removes the toast. A block
 * box's start edge is fixed by the flow, so it fills toward the end —
 * automatically the same direction as the text above it in both LTR and
 * RTL, with no explicit left/right needed.
 */
export function ToastContainer() {
  const { toasts, dismiss } = useToast()
  const { t, lang } = useLanguage()

  return (
    <div
      dir={lang === 'he' ? 'rtl' : 'ltr'}
      className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2 px-4"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`animate-toast-in pointer-events-auto w-full max-w-md overflow-hidden rounded-xl bg-surface/10 text-text shadow-lg ring-1 ring-inset ring-surface-muted/60 backdrop-blur-sm ${
            lang === 'he' ? 'font-ui-he' : 'font-ui-en'
          }`}
        >
          <div className="flex items-center gap-2 px-5 py-4 text-start text-base">
            <button
              onClick={() => dismiss(toast.id)}
              className="flex flex-1 items-center gap-3 text-start transition-transform duration-300 active:scale-95"
            >
              {toast.icon}
              {toast.message}
            </button>
            {toast.onUndo && (
              <button
                onClick={() => {
                  toast.onUndo?.()
                  dismiss(toast.id)
                }}
                className="flex-none rounded-md bg-surface-muted px-3 py-1.5 text-sm font-medium text-primary transition-transform duration-300 active:scale-95"
              >
                {t('undo')}
              </button>
            )}
          </div>
          <span
            className={`block h-1 ${variantBarClass[toast.variant]}`}
            style={{ animation: `toast-countdown ${TOAST_DURATION_MS}ms linear forwards` }}
          />
        </div>
      ))}
    </div>
  )
}
