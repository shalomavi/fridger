import { useState, type FormEvent } from 'react'
import { useLanguage } from '@/features/household/useLanguage'
import { Button } from '@/shared/ui/Button'
import { PlusIcon, DetailsIcon, TagIcon, ChevronDownIcon } from '@/shared/ui/FormIcons'
import { CATEGORIES, type Category } from '@/shared/categories'

/** Name is required; details is one free-text field, optional, no unit
 * picker; category is an optional manual tag (see shared/categories.ts). */
export function AddItemInput({
  onAdd,
}: {
  onAdd: (name: string, details?: string, category?: Category | null) => void
}) {
  const { t } = useLanguage()
  const [name, setName] = useState('')
  const [details, setDetails] = useState('')
  const [category, setCategory] = useState<Category | ''>('')

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) return
    onAdd(trimmedName, details.trim() || undefined, category || null)
    setName('')
    setDetails('')
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
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder={t('detailsPlaceholder')}
            autoComplete="off"
            className="w-full min-w-0 rounded-lg bg-surface py-3 ps-8 pe-3 text-text outline-none focus:ring-2 focus:ring-primary-ring"
          />
          <DetailsIcon className="pointer-events-none absolute inset-y-0 start-2.5 my-auto text-text-subtle" />
        </div>
        <div className="relative min-w-0 flex-1">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category | '')}
            className={`w-full min-w-0 appearance-none truncate rounded-lg bg-surface py-3 ps-8 pe-8 outline-none focus:ring-2 focus:ring-primary-ring ${
              category ? 'text-text' : 'text-text-subtle'
            }`}
          >
            <option value="">{t('categoryPlaceholder')}</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {t(`category_${c}`)}
              </option>
            ))}
          </select>
          <TagIcon className="pointer-events-none absolute inset-y-0 start-2.5 my-auto text-text-subtle" />
          <ChevronDownIcon className="pointer-events-none absolute inset-y-0 end-2.5 my-auto h-3.5 w-3.5 text-text-subtle" />
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
