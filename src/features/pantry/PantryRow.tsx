import { useRef, useState } from 'react'
import type { PantryItem } from './api'
import { useLanguage } from '@/features/household/useLanguage'
import { AmountEditor } from '@/shared/ui/AmountEditor'

const SWIPE_THRESHOLD = 72

/**
 * Swipe left to consume, or tap the "Used" button — the swipe alone isn't
 * accessible input, so both exist and do the same thing. The gesture stays
 * a physical left-drag in both languages; only the label text follows the
 * language setting (RTL mirrors the whole layout, but not this gesture).
 */
export function PantryRow({
  item,
  onConsume,
  onUpdateAmount,
}: {
  item: PantryItem
  onConsume: () => void
  onUpdateAmount: (amount: string | null) => void
}) {
  const { t } = useLanguage()
  const [dragX, setDragX] = useState(0)
  const dragging = useRef<{ startX: number } | null>(null)

  function onPointerDown(e: React.PointerEvent) {
    dragging.current = { startX: e.clientX }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current) return
    const delta = e.clientX - dragging.current.startX
    setDragX(Math.min(0, delta)) // only allow dragging left
  }

  function onPointerUp() {
    if (!dragging.current) return
    dragging.current = null
    if (dragX < -SWIPE_THRESHOLD) {
      onConsume()
    } else {
      setDragX(0)
    }
  }

  return (
    <li className="relative overflow-hidden rounded-lg">
      <div className="absolute inset-0 flex items-center justify-end bg-rose-700 px-4 text-sm text-white">
        {t('used')}
      </div>
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{ transform: `translateX(${dragX}px)` }}
        className="relative flex touch-pan-y items-center justify-between gap-3 bg-slate-800 px-4 py-3 transition-transform"
      >
        <span className="text-slate-100">{item.name}</span>
        <div className="flex items-center gap-3">
          <AmountEditor
            amount={item.amount}
            onSave={onUpdateAmount}
            placeholder={t('amountPlaceholder')}
          />
          <button
            onClick={onConsume}
            className="rounded-md bg-slate-700 px-2 py-1 text-xs text-slate-300"
          >
            {t('used')}
          </button>
        </div>
      </div>
    </li>
  )
}
