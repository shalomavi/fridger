import { useState } from 'react'
import { DeleteButton } from './DeleteButton'
import type { ShoppingItem } from './api'
import { useLanguage } from '@/features/household/useLanguage'
import { AmountEditor } from '@/shared/ui/AmountEditor'
import { CategoryPicker } from '@/shared/ui/CategoryPicker'
import { Surface } from '@/shared/ui/Surface'
import type { Category } from '@/shared/categories'

export function ShoppingRow({
  item,
  onToggle,
  onUpdateAmount,
  onUpdateCategory,
  onDelete,
  amountPlaceholder,
  deleteLabel,
  confirmDeleteMessage,
}: {
  item: ShoppingItem
  onToggle: () => void
  onUpdateAmount: (amount: string | null) => void
  onUpdateCategory: (category: Category | null) => void
  onDelete: () => void
  amountPlaceholder: string
  deleteLabel: string
  confirmDeleteMessage: string
}) {
  const { lang } = useLanguage()
  const purchased = item.status === 'purchased'
  // Deleting has no undo (unlike checking one off), so it plays a fade+
  // collapse before the actual delete fires instead of the row just
  // vanishing the instant the confirm dialog closes.
  const [removing, setRemoving] = useState(false)

  function handleDelete() {
    setRemoving(true)
    setTimeout(onDelete, 500)
  }

  return (
    <Surface
      as="li"
      style={{ animation: 'item-in 1s ease-out' }}
      className={`overflow-hidden transition-all duration-500 ease-in ${
        removing ? 'max-h-0 p-0 opacity-0' : 'max-h-56 p-3 opacity-100'
      }`}
    >
      <div className="flex items-center gap-3">
        <button onClick={onToggle} className="flex flex-1 items-center gap-3 text-start">
          <span
            className={`relative flex h-5 w-5 flex-none items-center justify-center rounded-full border-2 transition-colors duration-300 ${
              purchased ? 'border-primary-ring bg-primary-ring' : 'border-text-subtle'
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
        <AmountEditor amount={item.amount} onSave={onUpdateAmount} placeholder={amountPlaceholder} />
      </div>
    </Surface>
  )
}
