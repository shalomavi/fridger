import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

/**
 * Modal confirm, replacing window.confirm — same "surface a decision to the
 * user" job as toasts and pantry alerts, just blocking instead of transient.
 * Any call site awaits `confirm(options)`; ConfirmDialog (mounted once in
 * main.tsx) renders whatever is pending.
 */
export type ConfirmOptions = {
  message: string
  confirmLabel: string
  cancelLabel: string
  destructive?: boolean
}
type PendingConfirm = ConfirmOptions & { resolve: (value: boolean) => void }

type ConfirmContextValue = {
  pending: PendingConfirm | null
  confirm: (options: ConfirmOptions) => Promise<boolean>
  respond: (value: boolean) => void
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null)

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<PendingConfirm | null>(null)

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => setPending({ ...options, resolve }))
  }, [])

  const respond = useCallback((value: boolean) => {
    setPending((current) => {
      current?.resolve(value)
      return null
    })
  }, [])

  return (
    <ConfirmContext.Provider value={{ pending, confirm, respond }}>
      {children}
    </ConfirmContext.Provider>
  )
}

function useConfirmContext() {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirm must be used within a ConfirmProvider')
  return ctx
}

/** For call sites: `if (await confirm({ message, confirmLabel, cancelLabel })) …` */
export function useConfirm() {
  return useConfirmContext().confirm
}

/** For ConfirmDialog only — the pending request plus how to answer it. */
export function useConfirmDialogState() {
  const { pending, respond } = useConfirmContext()
  return { pending, respond }
}
