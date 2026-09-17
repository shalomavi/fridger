import { useState, type FormEvent } from 'react'
import { useLanguage } from '@/features/household/useLanguage'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Select } from '@/shared/ui/Select'
import { PlusIcon, DetailsIcon, TagIcon } from '@/shared/ui/FormIcons'
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
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t('addItemPlaceholder')}
        autoComplete="off"
        className="w-full px-4 py-3"
      />
      <div className="flex gap-2">
        <div className="relative w-24 min-w-0 flex-none">
          <Input
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder={t('detailsPlaceholder')}
            autoComplete="off"
            className="w-full min-w-0 py-3 ps-8 pe-3"
          />
          <DetailsIcon className="pointer-events-none absolute inset-y-0 start-2.5 my-auto text-text-subtle" />
        </div>
        <Select
          value={category}
          onChange={(v) => setCategory(v as Category | '')}
          options={CATEGORIES.map((c) => ({ value: c, label: t(`category_${c}`) }))}
          placeholder={t('categoryPlaceholder')}
          ariaLabel={t('categoryPlaceholder')}
          leadingIcon={TagIcon}
          className="flex-1"
        />
        <Button
          type="submit"
          disabled={!name.trim()}
          aria-label={t('add')}
          className="flex h-12 w-12 flex-none items-center justify-center"
        >
          <PlusIcon />
        </Button>
      </div>
    </form>
  )
}
