import { useState, type FormEvent } from 'react'
import { useLanguage } from '@/features/household/useLanguage'
import { Button } from '@/shared/ui/Button'
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
    <form onSubmit={onSubmit} className="flex flex-wrap gap-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t('addItemPlaceholder')}
        autoComplete="off"
        className="min-w-0 flex-1 rounded-lg bg-surface px-4 py-3 text-text outline-none focus:ring-2 focus:ring-primary-ring"
      />
      <input
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder={t('amountPlaceholder')}
        autoComplete="off"
        className="w-24 min-w-0 rounded-lg bg-surface px-3 py-3 text-text outline-none focus:ring-2 focus:ring-primary-ring"
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value as Category | '')}
        className="min-w-0 rounded-lg bg-surface px-3 py-3 text-text outline-none focus:ring-2 focus:ring-primary-ring"
      >
        <option value="">{t('categoryPlaceholder')}</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {t(`category_${c}`)}
          </option>
        ))}
      </select>
      <Button type="submit" disabled={!name.trim()} className="px-5">
        {t('add')}
      </Button>
    </form>
  )
}
