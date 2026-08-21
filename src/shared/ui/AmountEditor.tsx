import { useState } from 'react'

/**
 * Tap the amount to edit it inline — free text, same as adding one (no
 * number+unit split). Used on both the shopping list and pantry rows, which
 * both live inside a tappable/swipeable row, so every handler here stops
 * propagation to avoid triggering the row's own tap/drag behavior.
 */
export function AmountEditor({
  amount,
  onSave,
  placeholder,
}: {
  amount: string | null
  onSave: (amount: string | null) => void
  placeholder: string
}) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(amount ?? '')

  function startEditing(e: React.SyntheticEvent) {
    e.stopPropagation()
    setValue(amount ?? '')
    setEditing(true)
  }

  function save() {
    setEditing(false)
    const trimmed = value.trim()
    if (trimmed !== (amount ?? '')) onSave(trimmed || null)
  }

  if (!editing) {
    return (
      <button
        onClick={startEditing}
        onPointerDown={(e) => e.stopPropagation()}
        className="text-sm text-text-subtle underline decoration-dotted underline-offset-2"
      >
        {amount || placeholder}
      </button>
    )
  }

  return (
    <input
      autoFocus
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onBlur={save}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          save()
        }
        if (e.key === 'Escape') setEditing(false)
      }}
      className="w-20 rounded bg-surface-muted px-2 py-0.5 text-sm text-text outline-none"
    />
  )
}
