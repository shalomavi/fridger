import { useState } from 'react'
import { UNITS, formatNumber, type Unit } from '@/domain/units'
import { useLanguage } from '@/features/household/useLanguage'

/**
 * Quantity + unit together, since a merge or "cooked this" reduction needs
 * both at once. The number uses DetailsEditor's tap-to-edit pattern; the
 * unit uses CategoryPicker's invisible-overlay <select> so it stays compact
 * and saves immediately on change, no separate edit mode.
 */
export function QuantityEditor({
  quantity,
  unit,
  onSave,
}: {
  quantity: number
  unit: Unit
  onSave: (quantity: number, unit: Unit) => void
}) {
  const { t } = useLanguage()
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(String(quantity))

  function startEditing(e: React.SyntheticEvent) {
    e.stopPropagation()
    setValue(String(quantity))
    setEditing(true)
  }

  function saveQuantity() {
    setEditing(false)
    const parsed = Math.max(0.01, Number(value) || 1)
    if (parsed !== quantity) onSave(parsed, unit)
  }

  const quantityControl = editing ? (
    <input
      autoFocus
      type="number"
      min={0.01}
      step="any"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onBlur={saveQuantity}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          saveQuantity()
        }
        if (e.key === 'Escape') setEditing(false)
      }}
      className="w-14 rounded bg-surface-muted px-2 py-0.5 text-sm text-text outline-none"
    />
  ) : (
    <button
      onClick={startEditing}
      onPointerDown={(e) => e.stopPropagation()}
      className="text-sm text-text-subtle underline decoration-dotted underline-offset-2"
    >
      {formatNumber(quantity)}
    </button>
  )

  const unitControl = (
    <span className="relative inline-flex items-center">
      <span className="text-sm text-text-subtle underline decoration-dotted underline-offset-2">
        {unit === 'count' ? '×' : t(`unit_${unit}`)}
      </span>
      <select
        value={unit}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        onChange={(e) => onSave(quantity, e.target.value as Unit)}
        aria-label={t('unitPlaceholder')}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      >
        {UNITS.map((u) => (
          <option key={u} value={u} className="bg-surface text-text">
            {t(`unit_${u}`)}
          </option>
        ))}
      </select>
    </span>
  )

  return (
    <span className="inline-flex items-center gap-1">
      {unit === 'count' ? (
        <>
          {unitControl}
          {quantityControl}
        </>
      ) : (
        <>
          {quantityControl}
          {unitControl}
        </>
      )}
    </span>
  )
}
