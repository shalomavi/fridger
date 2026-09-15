import { useState } from 'react'
import { useShoppingList } from './useShoppingList'
import { AddItemInput } from './AddItemInput'
import { DeleteButton } from './DeleteButton'
import type { ShoppingItem } from './api'
import { useHousehold } from '@/features/household/useHousehold'
import { useLanguage } from '@/features/household/useLanguage'
import { AmountEditor } from '@/shared/ui/AmountEditor'
import { CategoryPicker } from '@/shared/ui/CategoryPicker'
import { SearchInput } from '@/shared/ui/SearchInput'
import { CategoryHeading } from '@/shared/ui/CategoryHeading'
import { Surface } from '@/shared/ui/Surface'
import { resolveCategoryOrder, type Category } from '@/shared/categories'
import { groupByCategory } from '@/domain/groupByCategory'
import { filterByName } from '@/domain/filterByName'

function Row({
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
  return (
    <Surface as="li" className="p-3">
      <div className="flex items-center gap-3">
        <button onClick={onToggle} className="flex flex-1 items-center gap-3 text-start">
          <span
            className={`h-5 w-5 flex-none rounded-full border-2 ${
              purchased ? 'border-primary-ring bg-primary-ring' : 'border-text-subtle'
            }`}
          />
          <span
            className={`flex-1 ${lang === 'he' ? 'font-list-he' : 'font-list-en'} ${
              purchased ? 'text-text-subtle line-through' : 'text-text'
            }`}
          >
            {item.name}
          </span>
        </button>
        <DeleteButton onDelete={onDelete} label={deleteLabel} confirmMessage={confirmDeleteMessage} />
      </div>
      {/* ps-8 lines this row up under the name text (h-5 checkbox + gap-3). */}
      <div className="mt-1.5 flex items-center gap-3 ps-8">
        <CategoryPicker category={item.category} onSave={onUpdateCategory} />
        <AmountEditor amount={item.amount} onSave={onUpdateAmount} placeholder={amountPlaceholder} />
      </div>
    </Surface>
  )
}

/** Splits a status group into its category sections, in the household's
 * chosen order (settings/CategoryOrderSettings) — empty sections are
 * dropped, uncategorized items land in one trailing group. */
function GroupedItems({
  items,
  order,
  row,
}: {
  items: ShoppingItem[]
  order: Category[]
  row: (item: ShoppingItem) => React.ReactNode
}) {
  return (
    <div className="space-y-4">
      {groupByCategory(items, order).map((group) => (
        <div key={group.category ?? 'uncategorized'}>
          <CategoryHeading category={group.category} />
          <ul className="space-y-2">{group.items.map(row)}</ul>
        </div>
      ))}
    </div>
  )
}

export function ShoppingList({ householdId }: { householdId: string }) {
  const { t } = useLanguage()
  const { data: household } = useHousehold()
  const { data: items, isLoading, addItem, toggleItem, updateAmount, updateCategory, deleteItem } =
    useShoppingList(householdId)
  const [query, setQuery] = useState('')

  const order = resolveCategoryOrder(household?.category_order)
  const matched = filterByName(items ?? [], query)
  const pending = matched.filter((i) => i.status === 'pending')
  const purchased = matched.filter((i) => i.status === 'purchased')

  function row(item: ShoppingItem) {
    return (
      <Row
        key={item.id}
        item={item}
        onToggle={() => toggleItem.mutate(item)}
        onUpdateAmount={(amount) => updateAmount.mutate({ id: item.id, amount })}
        onUpdateCategory={(category) => updateCategory.mutate({ id: item.id, category })}
        onDelete={() => deleteItem.mutate(item.id)}
        amountPlaceholder={t('amountPlaceholder')}
        deleteLabel={t('deleteItem')}
        confirmDeleteMessage={t('confirmDeleteItem')}
      />
    )
  }

  return (
    <div className="space-y-6">
      <AddItemInput onAdd={(name, amount, category) => addItem.mutate({ name, amount, category })} />

      {!isLoading && items && items.length > 0 && (
        <SearchInput value={query} onChange={setQuery} placeholder={t('searchPlaceholder')} />
      )}

      {isLoading && <p className="text-text-subtle">{t('loading')}</p>}

      {!isLoading && items?.length === 0 && <p className="text-text-subtle">{t('nothingOnList')}</p>}

      {!isLoading && items && items.length > 0 && pending.length === 0 && purchased.length === 0 && (
        <p className="text-text-subtle">{t('noSearchResults')}</p>
      )}

      {pending.length > 0 && <GroupedItems items={pending} order={order} row={row} />}

      {purchased.length > 0 && (
        <div>
          <p className="mb-2 text-xs uppercase tracking-wide text-text-subtle">{t('checkedOff')}</p>
          <GroupedItems items={purchased} order={order} row={row} />
        </div>
      )}
    </div>
  )
}
