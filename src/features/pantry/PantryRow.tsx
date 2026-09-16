import { useRef, useState } from 'react'
import type { PantryItem } from './api'
import { useLanguage } from '@/features/household/useLanguage'
import { AmountEditor } from '@/shared/ui/AmountEditor'
import { CategoryPicker } from '@/shared/ui/CategoryPicker'
import { ExpiryEditor } from '@/shared/ui/ExpiryEditor'
import { isExpiringSoon } from '@/domain/expiry'
import type { Category } from '@/shared/categories'

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
  onUpdateCategory,
  onUpdateExpiry,
}: {
  item: PantryItem
  onConsume: () => void
  onUpdateAmount: (amount: string | null) => void
  onUpdateCategory: (category: Category | null) => void
  onUpdateExpiry: (expiresAt: string | null) => void
}) {
  const { t, lang } = useLanguage()
  const [dragX, setDragX] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const dragging = useRef<{ startX: number } | null>(null)
  const soon = isExpiringSoon(item.expires_at)

  // Finishes the swipe (or the tap-to-consume button) by sliding the row
  // the rest of the way off instead of cutting the gesture short — it
  // vanishing mid-drag the instant the mutation resolves looked broken.
  function startConsume() {
    setDragX(-500)
    setLeaving(true)
    setTimeout(onConsume, 220)
  }

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
      startConsume()
    } else {
      setDragX(0)
    }
  }

  return (
    <li
      className={`relative overflow-hidden rounded-lg transition-all duration-200 ${
        leaving ? 'max-h-0 opacity-0' : 'max-h-56 opacity-100'
      }`}
    >
      {/* The reveal is a fixed physical left-drag in both languages (see
       * the gesture note above), so it always uncovers on the physical
       * right. `justify-end` is flow-relative and would flip to the left
       * under the RTL `dir` the Hebrew layout sets, so this stays `dir="ltr"`
       * to pin the label to the right regardless of language. */}
      <div
        dir="ltr"
        className="absolute inset-0 flex items-center justify-end bg-danger-fill px-4 text-sm text-white"
      >
        {t('used')}
      </div>
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{ transform: `translateX(${dragX}px)` }}
        className={`relative flex touch-pan-y flex-col gap-1.5 px-4 py-3 transition-transform ${
          soon ? 'bg-surface ring-1 ring-inset ring-warning-ring/40' : 'bg-surface'
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <span className={`text-text ${lang === 'he' ? 'font-list-he' : 'font-list-en'}`}>
            {item.name}
          </span>
          <button
            onClick={startConsume}
            onPointerDown={(e) => e.stopPropagation()}
            className="flex-none rounded-md bg-surface-muted px-2 py-1 text-xs text-text-soft transition-transform active:scale-95"
          >
            {t('used')}
          </button>
        </div>
        <div className="flex items-center gap-3">
          <CategoryPicker category={item.category} onSave={onUpdateCategory} />
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
        </div>
      </div>
    </li>
  )
}
