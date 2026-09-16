import { useState } from 'react'
import { useShoppingList } from './useShoppingList'
import { AddItemInput } from './AddItemInput'
import { ShoppingRow } from './ShoppingRow'
import type { ShoppingItem } from './api'
import { useHousehold } from '@/features/household/useHousehold'
import { useLanguage } from '@/features/household/useLanguage'
import { SearchInput } from '@/shared/ui/SearchInput'
import { CategoryHeading } from '@/shared/ui/CategoryHeading'
import { resolveCategoryOrder, type Category } from '@/shared/categories'
import { groupByCategory } from '@/domain/groupByCategory'
import { filterByName } from '@/domain/filterByName'

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
      <ShoppingRow
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
