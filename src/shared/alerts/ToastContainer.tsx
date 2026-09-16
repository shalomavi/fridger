import { useToast, type ToastVariant } from './ToastContext'

const variantClass: Record<ToastVariant, string> = {
  success: 'bg-primary text-white',
  error: 'bg-danger-fill text-white',
  info: 'bg-surface-muted text-text',
}

/** Mounted once, near the root (see main.tsx) — every useToast().notify()
 * call anywhere in the app renders here. */
export function ToastContainer() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4">
      {toasts.map((toast) => (
        <button
          key={toast.id}
          onClick={() => dismiss(toast.id)}
          className={`animate-toast-in pointer-events-auto w-full max-w-sm rounded-lg px-4 py-3 text-start text-sm shadow-lg transition-transform duration-300 active:scale-95 ${variantClass[toast.variant]}`}
        >
          {toast.message}
        </button>
      ))}
    </div>
  )
}
