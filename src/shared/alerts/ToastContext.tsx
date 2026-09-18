import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

/**
 * Ephemeral feedback toasts — success/error/info today. A new kind of
 * transient feedback is just a new ToastVariant plus a color in
 * ToastContainer's variantClass map; nothing else in this file changes.
 * `icon` is a free-form slot (see shared/alerts/itemAddedToast.tsx) — the
 * context/container stay unaware of what any particular toast's icon means.
 */
export type ToastVariant = 'success' | 'error' | 'info'
export type Toast = {
  id: string
  variant: ToastVariant
  message: string
  icon?: ReactNode
  onUndo?: () => void
}

type ToastContextValue = {
  toasts: Toast[]
  notify: (message: string, variant?: ToastVariant, icon?: ReactNode, onUndo?: () => void) => void
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)
export const TOAST_DURATION_MS = 2000

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  // Same message already showing (e.g. a mutation error firing twice) is a
  // no-op, not a second stacked toast.
  const notify = useCallback(
    (message: string, variant: ToastVariant = 'info', icon?: ReactNode, onUndo?: () => void) => {
      setToasts((current) => {
        if (current.some((toast) => toast.message === message)) return current
        const id = crypto.randomUUID()
        setTimeout(() => dismiss(id), TOAST_DURATION_MS)
        return [...current, { id, variant, message, icon, onUndo }]
      })
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
