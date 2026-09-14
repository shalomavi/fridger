import { useState, type FormEvent } from 'react'
import { useLanguage } from '@/features/household/useLanguage'
import { Button } from '@/shared/ui/Button'
import { PlusIcon, QuantityIcon, TagIcon } from '@/shared/ui/FormIcons'
import { CATEGORIES, type Category } from '@/shared/categories'

/** Name is required; amount is one free-text field, optional, no unit
 * picker; category is an optional manual tag (see shared/categories.ts). */
export function AddItemInput({
  onAdd,
}: {
  onAdd: (name: string, amount?: string, category?: Category | null) => void
}) {
  const { t } = useLanguage()
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<Category | ''>('')

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) return
    onAdd(trimmedName, amount.trim() || undefined, category || null)
    setName('')
    setAmount('')
    setCategory('')
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t('addItemPlaceholder')}
        autoComplete="off"
        className="w-full rounded-lg bg-surface px-4 py-3 text-text outline-none focus:ring-2 focus:ring-primary-ring"
      />
      <div className="flex gap-2">
        <div className="relative w-24 min-w-0 flex-none">
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={t('amountPlaceholder')}
            autoComplete="off"
            className="w-full min-w-0 rounded-lg bg-surface py-3 ps-8 pe-3 text-text outline-none focus:ring-2 focus:ring-primary-ring"
          />
          <QuantityIcon className="pointer-events-none absolute inset-y-0 start-2.5 my-auto text-text-subtle" />
        </div>
        <div className="relative min-w-0 flex-1">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category | '')}
            className="w-full min-w-0 appearance-none truncate rounded-lg bg-surface py-3 ps-8 pe-3 text-text outline-none focus:ring-2 focus:ring-primary-ring"
          >
            <option value="">{t('categoryPlaceholder')}</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {t(`category_${c}`)}
              </option>
            ))}
          </select>
          <TagIcon className="pointer-events-none absolute inset-y-0 start-2.5 my-auto text-text-subtle" />
        </div>
        <Button
          type="submit"
          disabled={!name.trim()}
          aria-label={t('add')}
          className="flex flex-none items-center justify-center px-5 py-3"
        >
          <PlusIcon />
        </Button>
      </div>
    </form>
  )
}
