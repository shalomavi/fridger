import { useRef, useState } from 'react'
import type { PantryItem } from './api'
import { useLanguage } from '@/features/household/useLanguage'
import { AmountEditor } from '@/shared/ui/AmountEditor'
import { ExpiryEditor } from '@/shared/ui/ExpiryEditor'
import { isExpiringSoon } from '@/domain/expiry'

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
  onUpdateExpiry,
}: {
  item: PantryItem
  onConsume: () => void
  onUpdateAmount: (amount: string | null) => void
  onUpdateExpiry: (expiresAt: string | null) => void
}) {
  const { t, lang } = useLanguage()
  const [dragX, setDragX] = useState(0)
  const dragging = useRef<{ startX: number } | null>(null)
  const soon = isExpiringSoon(item.expires_at)

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
      <div className="absolute inset-0 flex items-center justify-end bg-danger-fill px-4 text-sm text-white">
        {t('used')}
      </div>
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{ transform: `translateX(${dragX}px)` }}
        className={`relative flex touch-pan-y flex-wrap items-center justify-between gap-x-3 gap-y-1 px-4 py-3 transition-transform ${
          soon ? 'bg-surface ring-1 ring-inset ring-warning-ring/40' : 'bg-surface'
        }`}
      >
        <span className={`text-text ${lang === 'he' ? 'font-list-he' : 'font-list-en'}`}>
          {item.name}
        </span>
        <div className="flex items-center gap-3">
          <ExpiryEditor
            expiresAt={item.expires_at}
            onSave={onUpdateExpiry}
            placeholder={t('expiryPlaceholder')}
          />
          <AmountEditor
            amount={item.amount}
            onSave={onUpdateAmount}
            placeholder={t('amountPlaceholder')}
          />
          <button
            onClick={onConsume}
            onPointerDown={(e) => e.stopPropagation()}
            className="rounded-md bg-surface-muted px-2 py-1 text-xs text-text-soft"
          >
            {t('used')}
          </button>
        </div>
      </div>
    </li>
  )
}
