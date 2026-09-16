import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

/**
 * Ephemeral feedback toasts — success/error/info today. A new kind of
 * transient feedback is just a new ToastVariant plus a color in
 * ToastContainer's variantClass map; nothing else in this file changes.
 */
export type ToastVariant = 'success' | 'error' | 'info'
export type Toast = { id: string; variant: ToastVariant; message: string }

type ToastContextValue = {
  toasts: Toast[]
  notify: (message: string, variant?: ToastVariant) => void
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)
const AUTO_DISMISS_MS = 4000

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const notify = useCallback(
    (message: string, variant: ToastVariant = 'info') => {
      const id = crypto.randomUUID()
      setToasts((current) => [...current, { id, variant, message }])
      setTimeout(() => dismiss(id), AUTO_DISMISS_MS)
    },
    [dismiss],
  )

  return (
    <ToastContext.Provider value={{ toasts, notify, dismiss }}>{children}</ToastContext.Provider>
  )
}

/** Throws outside a ToastProvider — every screen is a descendant of the one
 * mounted in main.tsx, so a call site missing it is a wiring bug, not a
 * case to degrade gracefully for. */
export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a ToastProvider')
  return ctx
}
