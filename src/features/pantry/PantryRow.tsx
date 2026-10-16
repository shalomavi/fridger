import { useLayoutEffect, useRef, useState } from 'react'
import type { PantryItem } from './api'
import { useLanguage } from '@/features/household/useLanguage'
import { DetailsEditor } from '@/shared/ui/DetailsEditor'
import { QuantityEditor } from '@/shared/ui/QuantityEditor'
import { CategoryPicker } from '@/shared/ui/CategoryPicker'
import { ExpiryEditor } from '@/shared/ui/ExpiryEditor'
import { isExpiringSoon } from '@/domain/expiry'
import { isHebrewText } from '@/domain/script'
import { PackageXIcon, ShoppingCartIcon } from '@/shared/ui/FormIcons'
import { glowShadow, softButtonShadow } from '@/shared/ui/elevation'
import type { Category } from '@/shared/categories'
import type { Unit } from '@/domain/units'

const SWIPE_THRESHOLD = 72
const ROW_GAP = 12 // gap-x-3 in the name row

/**
 * Swipe left to consume, or tap the "Used" button — the swipe alone isn't
 * accessible input, so both exist and do the same thing. The gesture stays
 * a physical left-drag in both languages; only the label text follows the
 * language setting (RTL mirrors the whole layout, but not this gesture).
 */
export function PantryRow({
  item,
  onConsume,
  onMoveToShopping,
  onUpdateDetails,
  onUpdateQuantity,
  onUpdateCategory,
  onUpdateExpiry,
}: {
  item: PantryItem
  onConsume: () => void
  onMoveToShopping: () => void
  onUpdateDetails: (details: string | null) => void
  onUpdateQuantity: (quantity: number, unit: Unit) => void
  onUpdateCategory: (category: Category | null) => void
  onUpdateExpiry: (expiresAt: string | null) => void
}) {
  const { t } = useLanguage()
  const [dragX, setDragX] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const dragging = useRef<{ startX: number } | null>(null)
  const consumed = useRef(false)
  const soon = isExpiringSoon(item.expires_at)

  // The action buttons share the name/quantity row when they fit beside it;
  // when they don't, they join the category/expiry/details row instead of
  // wrapping onto a line of their own. CSS can't pick between two rows, so
  // this measures: name + quantity + buttons against the row's width.
  const [buttonsInline, setButtonsInline] = useState(true)
  const nameRowRef = useRef<HTMLDivElement>(null)
  const nameRef = useRef<HTMLSpanElement>(null)
  const quantityRef = useRef<HTMLSpanElement>(null)
  const buttonsRef = useRef<HTMLDivElement>(null)
  const buttonsWidth = useRef(72)
  useLayoutEffect(() => {
    const row = nameRowRef.current
    const name = nameRef.current
    const quantity = quantityRef.current
    if (!row || !name || !quantity) return
    function measure() {
      if (buttonsRef.current) buttonsWidth.current = buttonsRef.current.offsetWidth
      const needed = name!.offsetWidth + quantity!.offsetWidth + buttonsWidth.current + ROW_GAP * 2
      setButtonsInline(needed <= row!.clientWidth)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(row)
    observer.observe(name)
    observer.observe(quantity)
    return () => observer.disconnect()
  }, [])

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

  const actionButtons = (
    <div ref={buttonsRef} className="ms-auto flex flex-none gap-2">
      <button
        onClick={onMoveToShopping}
        onPointerDown={(e) => e.stopPropagation()}
        aria-label={t('moveToShoppingList')}
        title={t('moveToShoppingList')}
        className={`flex-none rounded-md bg-surface-muted px-2 py-1 text-text-soft transition-transform duration-300 active:scale-95 ${softButtonShadow}`}
      >
        <ShoppingCartIcon className="size-4" />
      </button>
      <button
        onClick={startConsume}
        onPointerDown={(e) => e.stopPropagation()}
        aria-label={t('used')}
        title={t('used')}
        className={`flex-none rounded-md bg-surface-muted px-2 py-1 text-text-soft transition-transform duration-300 active:scale-95 ${softButtonShadow}`}
      >
        <PackageXIcon className="size-4" />
      </button>
    </div>
  )

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
        className={`relative flex touch-pan-y flex-col gap-1.5 rounded-lg px-4 py-3 transition-transform duration-300 ${
          soon ? 'bg-surface ring-1 ring-inset ring-warning-ring/40' : 'bg-surface'
        }`}
      >
        <div ref={nameRowRef} className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span
            ref={nameRef}
            className={`text-xl font-bold text-text ${isHebrewText(item.name) ? 'font-list-he' : 'font-list-en'}`}
          >
            {item.name}
          </span>
          <span ref={quantityRef} className="flex">
            <QuantityEditor quantity={item.quantity} unit={item.unit} onSave={onUpdateQuantity} />
          </span>
          {buttonsInline && actionButtons}
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
          {!buttonsInline && actionButtons}
        </div>
      </div>
    </li>
  )
}
