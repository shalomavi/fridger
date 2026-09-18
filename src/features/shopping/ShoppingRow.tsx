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
  // Plays a fade+collapse before the actual delete fires instead of the row
  // just vanishing the instant the confirm dialog closes.
  const [removing, setRemoving] = useState(false)
  const deleted = useRef(false)

  function fireDelete() {
    if (deleted.current) return
    deleted.current = true
    onDelete()
  }

  function handleDelete() {
    setRemoving(true)
    // Safety net if transitionend never fires (e.g. the tab is backgrounded
    // mid-animation) — comfortably past the 500ms transition, so it never
    // wins the race under normal conditions.
    setTimeout(fireDelete, 800)
  }

  // A fixed setTimeout raced the actual transition (React's commit delay
  // plus real paint time on a phone can easily push it past 500ms), cutting
  // the animation off mid-collapse. Firing on transitionend instead keeps
  // the two in sync — gated to the opacity leg specifically, since browser
  // support for animating grid-template-rows itself is patchier and can
  // fire its own transitionend near-instantly instead of after 500ms.
  function handleTransitionEnd(e: React.TransitionEvent<HTMLLIElement>) {
    if (!removing) return
    if (e.target !== e.currentTarget || e.propertyName !== 'opacity') return
    fireDelete()
  }

  return (
    // grid-rows 1fr->0fr instead of max-height: max-height leaves a dead zone
    // (nothing visibly shrinks until it drops below the real content height,
    // then it snaps shut) — grid-rows animates the real rendered height the
    // whole way, no measurement needed.
    <Surface
      as="li"
      style={{ animation: 'item-in 300ms ease-out' }}
      onTransitionEnd={handleTransitionEnd}
      className={`grid overflow-hidden transition-all duration-500 ${
        removing ? 'grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr] opacity-100'
      }`}
    >
      <div className="overflow-hidden p-3">
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
      </div>
    </Surface>
  )
}
