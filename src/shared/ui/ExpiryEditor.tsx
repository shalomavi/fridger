import { useState } from 'react'
import { isExpiringSoon, toDateInputValue, formatDateDisplay } from '@/domain/expiry'
import { statusTextClass } from '@/shared/ui/Badge'

/** Same tap-to-edit pattern as AmountEditor, with a native date picker and
 * an amber highlight once the date is within the "expiring soon" window. */
export function ExpiryEditor({
  expiresAt,
  onSave,
  placeholder,
}: {
  expiresAt: string | null
  onSave: (expiresAt: string | null) => void
  placeholder: string
}) {
  const [editing, setEditing] = useState(false)
  const soon = isExpiringSoon(expiresAt)

  if (!editing) {
    return (
      <button
        onClick={(e) => {
          e.stopPropagation()
          setEditing(true)
        }}
        onPointerDown={(e) => e.stopPropagation()}
        className={`text-sm underline decoration-dotted underline-offset-2 ${
          soon ? statusTextClass('warning') : 'text-text-subtle'
        }`}
      >
        {expiresAt ? formatDateDisplay(expiresAt) : placeholder}
      </button>
    )
  }

  return (
    <input
      type="date"
      autoFocus
      defaultValue={toDateInputValue(expiresAt)}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onChange={(e) => {
        onSave(e.target.value || null)
        setEditing(false)
      }}
      onBlur={() => setEditing(false)}
      className="rounded bg-surface-muted px-2 py-0.5 text-sm text-text outline-none"
    />
  )
}
