import { useRef, useState } from 'react'
import type { PantryItem } from './api'
import { useLanguage } from '@/features/household/useLanguage'
import { DetailsEditor } from '@/shared/ui/DetailsEditor'
import { QuantityEditor } from '@/shared/ui/QuantityEditor'
import { CategoryPicker } from '@/shared/ui/CategoryPicker'
import { ExpiryEditor } from '@/shared/ui/ExpiryEditor'
import { isExpiringSoon } from '@/domain/expiry'
import { glowShadow } from '@/shared/ui/elevation'
import type { Category } from '@/shared/categories'
import type { Unit } from '@/domain/units'

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
  onUpdateDetails,
  onUpdateQuantity,
  onUpdateCategory,
  onUpdateExpiry,
}: {
  item: PantryItem
  onConsume: () => void
  onUpdateDetails: (details: string | null) => void
  onUpdateQuantity: (quantity: number, unit: Unit) => void
  onUpdateCategory: (category: Category | null) => void
  onUpdateExpiry: (expiresAt: string | null) => void
}) {
  const { t, lang } = useLanguage()
  const [dragX, setDragX] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const dragging = useRef<{ startX: number } | null>(null)
  const consumed = useRef(false)
  const soon = isExpiringSoon(item.expires_at)

  function fireConsume() {
    if (consumed.current) return
    consumed.current = true
    onConsume()
  }

  // Finishes the swipe (or the tap-to-consume button) by sliding the row the
  // rest of the way off instead of cutting the gesture short — it vanishing
  // mid-drag the instant the mutation resolves looked broken. The row itself
  // plays item-out (index.css, shared with ShoppingRow's delete) alongside
  // the swipe, so pantry and shopping list rows leave the same way.
  function startConsume() {
    setDragX(-500)
    setLeaving(true)
    // Safety net if animationend never fires (e.g. the tab is backgrounded
    // mid-animation) — comfortably past the 300ms animation.
    setTimeout(fireConsume, 600)
  }

  function handleAnimationEnd(e: React.AnimationEvent<HTMLLIElement>) {
    if (e.animationName === 'item-out') fireConsume()
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
      style={{ animation: leaving ? 'item-out 300ms ease-in forwards' : 'item-in 300ms ease-out' }}
      onAnimationEnd={handleAnimationEnd}
      className={`relative overflow-hidden rounded-lg ${glowShadow}`}
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
        className={`relative flex touch-pan-y flex-col gap-1.5 px-4 py-3 transition-transform duration-300 ${
          soon ? 'bg-surface ring-1 ring-inset ring-warning-ring/40' : 'bg-surface'
        }`}
      >
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className={`text-text ${lang === 'he' ? 'font-list-he' : 'font-list-en'}`}>
            {item.name}
          </span>
          <QuantityEditor quantity={item.quantity} unit={item.unit} onSave={onUpdateQuantity} />
          <button
            onClick={startConsume}
            onPointerDown={(e) => e.stopPropagation()}
            className="ms-auto flex-none rounded-md bg-surface-muted px-2 py-1 text-xs text-text-soft transition-transform duration-300 active:scale-95"
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
          <DetailsEditor
            details={item.details}
            onSave={onUpdateDetails}
            placeholder={t('detailsPlaceholder')}
          />
        </div>
      </div>
    </li>
  )
}
