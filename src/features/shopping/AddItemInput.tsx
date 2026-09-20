import { useState, type FormEvent } from 'react'
import { useLanguage } from '@/features/household/useLanguage'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Select } from '@/shared/ui/Select'
import { PlusIcon, HashIcon, NotesIcon, RulerIcon, TagIcon } from '@/shared/ui/FormIcons'
import { CATEGORIES, type Category } from '@/shared/categories'
import { UNITS, type Unit } from '@/domain/units'

/** Name is required; quantity + unit default to 1/count and merge by
 * addition when the same item is added twice — see domain/mergeQuantity.ts;
 * details is one free-text field, optional, for anything quantity+unit
 * don't capture; category is an optional manual tag (shared/categories.ts). */
export function AddItemInput({
  onAdd,
}: {
  onAdd: (
    name: string,
    details: string | undefined,
    category: Category | null,
    quantity: number,
    unit: Unit,
  ) => void
}) {
  const { t } = useLanguage()
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [unit, setUnit] = useState<Unit>('count')
  const [details, setDetails] = useState('')
  const [category, setCategory] = useState<Category | ''>('')

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) return
    const parsedQuantity = Math.max(0.01, Number(quantity) || 1)
    onAdd(trimmedName, details.trim() || undefined, category || null, parsedQuantity, unit)
    setName('')
    setQuantity('1')
    setUnit('count')
    setDetails('')
    setCategory('')
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t('addItemPlaceholder')}
        autoComplete="off"
        className="w-full px-4 py-3"
      />
      <div className="flex gap-2">
        <div className="relative w-18 min-w-0 flex-none">
          <Input
            type="number"
            min={0.01}
            step="any"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            aria-label={t('quantityPlaceholder')}
            className="w-full min-w-0 py-3 ps-8 pe-3"
          />
          <HashIcon className="pointer-events-none absolute inset-y-0 inset-s-2.5 my-auto text-text-subtle" />
        </div>
        <Select
          value={unit}
          onChange={(v) => setUnit(v as Unit)}
          options={UNITS.map((u) => ({ value: u, label: t(`unit_${u}`) }))}
          placeholder={t('unitPlaceholder')}
          ariaLabel={t('unitPlaceholder')}
          leadingIcon={RulerIcon}
          className="w-28 flex-none"
        />
        <div className="relative min-w-0 flex-1">
          <Input
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder={t('detailsPlaceholder')}
            autoComplete="off"
            className="w-full min-w-0 py-3 ps-8 pe-3"
          />
          <NotesIcon className="pointer-events-none absolute inset-y-0 inset-s-2.5 my-auto text-text-subtle" />
        </div>
      </div>
      <div className="flex gap-2">
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
