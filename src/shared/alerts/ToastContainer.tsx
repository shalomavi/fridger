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
 * strip that shrinks from full width to nothing over TOAST_DURATION_MS,
 * timed to the same setTimeout that actually removes the toast.
 */
export function ToastContainer() {
  const { toasts, dismiss } = useToast()
  const { lang } = useLanguage()

  return (
    <div
      dir={lang === 'he' ? 'rtl' : 'ltr'}
      className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2 px-4"
    >
      {toasts.map((toast) => (
        <button
          key={toast.id}
          onClick={() => dismiss(toast.id)}
          className={`animate-toast-in pointer-events-auto w-full max-w-md overflow-hidden rounded-xl bg-surface/10 text-text shadow-lg ring-1 ring-inset ring-surface-muted/60 backdrop-blur-sm transition-transform duration-300 active:scale-95 ${
            lang === 'he' ? 'font-ui-he' : 'font-ui-en'
          }`}
        >
          <span className="flex items-center gap-3 px-5 py-4 text-start text-base">
            {toast.icon}
            {toast.message}
          </span>
          <span
            className={`block h-1 ${variantBarClass[toast.variant]}`}
            style={{ animation: `toast-countdown ${TOAST_DURATION_MS}ms linear forwards` }}
          />
        </button>
      ))}
    </div>
  )
}
