import { useRef, useState } from 'react'
import { DeleteButton } from './DeleteButton'
import type { ShoppingItem } from './api'
import { useLanguage } from '@/features/household/useLanguage'
import { DetailsEditor } from '@/shared/ui/DetailsEditor'
import { CategoryPicker } from '@/shared/ui/CategoryPicker'
import { Surface } from '@/shared/ui/Surface'
import type { Category } from '@/shared/categories'

export function ShoppingRow({
  item,
  onToggle,
  onUpdateDetails,
  onUpdateCategory,
  onDelete,
  detailsPlaceholder,
  deleteLabel,
  confirmDeleteMessage,
}: {
  item: ShoppingItem
  onToggle: () => void
  onUpdateDetails: (details: string | null) => void
  onUpdateCategory: (category: Category | null) => void
  onDelete: () => void
  detailsPlaceholder: string
  deleteLabel: string
  confirmDeleteMessage: string
}) {
  const { lang } = useLanguage()
  const purchased = item.status === 'purchased'
  // item-out (index.css) is the reverse of the item-in entrance below, so a
  // deleted row plays the mirror image of how it arrived instead of a
  // differently-timed, differently-shaped exit.
  const [removing, setRemoving] = useState(false)
  const deleted = useRef(false)

  function fireDelete() {
    if (deleted.current) return
    deleted.current = true
    onDelete()
  }

  function handleDelete() {
    setRemoving(true)
    // Safety net if animationend never fires (e.g. the tab is backgrounded
    // mid-animation) — comfortably past the 300ms animation.
    setTimeout(fireDelete, 600)
  }

  function handleAnimationEnd(e: React.AnimationEvent<HTMLLIElement>) {
    if (e.animationName === 'item-out') fireDelete()
  }

  return (
    <Surface
      as="li"
      style={{ animation: removing ? 'item-out 300ms ease-in forwards' : 'item-in 300ms ease-out' }}
      onAnimationEnd={handleAnimationEnd}
      className="overflow-hidden p-3"
    >
      <div className="flex items-center gap-3">
        <button onClick={onToggle} className="flex flex-1 items-center gap-3 text-start">
          <span
            className={`relative flex h-5 w-5 flex-none items-center justify-center rounded-full border-2 transition-colors duration-300 ${
              purchased ? 'border-primary bg-primary' : 'border-text-subtle'
            }`}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
              className={`transition-transform duration-300 ${purchased ? 'scale-100' : 'scale-0'}`}
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>
          <span
            className={`flex-1 transition-colors duration-300 ${lang === 'he' ? 'font-list-he' : 'font-list-en'} ${
              purchased ? 'text-text-subtle line-through' : 'text-text'
            }`}
          >
            {item.name}
          </span>
        </button>
        <DeleteButton onDelete={handleDelete} label={deleteLabel} confirmMessage={confirmDeleteMessage} />
      </div>
      {/* ps-8 lines this row up under the name text (h-5 checkbox + gap-3). */}
      <div className="mt-1.5 flex items-center gap-3 ps-8">
        <CategoryPicker category={item.category} onSave={onUpdateCategory} />
        <DetailsEditor details={item.details} onSave={onUpdateDetails} placeholder={detailsPlaceholder} />
      </div>
    </Surface>
  )
}
