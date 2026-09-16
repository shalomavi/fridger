import { useConfirmDialogState } from './ConfirmContext'

/** Mounted once, near the root (see main.tsx) — renders whatever confirm()
 * call is currently pending, or nothing. */
export function ConfirmDialog() {
  const { pending, respond } = useConfirmDialogState()
  if (!pending) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6"
      onClick={() => respond(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-toast-in w-full max-w-sm rounded-lg bg-surface p-4 shadow-lg"
      >
        <p className="text-sm text-text">{pending.message}</p>
        <div className="mt-4 flex justify-end gap-2">
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
