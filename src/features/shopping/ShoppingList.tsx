import { useShoppingList } from './useShoppingList'
import { AddItemInput } from './AddItemInput'
import type { ShoppingItem } from './api'
import { useLanguage } from '@/features/household/useLanguage'
import { AmountEditor } from '@/shared/ui/AmountEditor'

function Row({
  item,
  onToggle,
  onUpdateAmount,
  amountPlaceholder,
}: {
  item: ShoppingItem
  onToggle: () => void
  onUpdateAmount: (amount: string | null) => void
  amountPlaceholder: string
}) {
  const purchased = item.status === 'purchased'
  return (
    <li className="flex items-center gap-2 rounded-lg bg-slate-800 pe-4">
      <button
        onClick={onToggle}
        className="flex flex-1 items-center gap-3 px-4 py-3 text-start"
      >
        <span
          className={`h-5 w-5 flex-none rounded-full border-2 ${
            purchased ? 'border-teal-500 bg-teal-500' : 'border-slate-500'
          }`}
        />
        <span
          className={`flex-1 ${purchased ? 'text-slate-500 line-through' : 'text-slate-100'}`}
        >
          {item.name}
        </span>
      </button>
      <AmountEditor amount={item.amount} onSave={onUpdateAmount} placeholder={amountPlaceholder} />
    </li>
  )
}

export function ShoppingList({ householdId }: { householdId: string }) {
  const { t } = useLanguage()
  const { data: items, isLoading, addItem, toggleItem, updateAmount } = useShoppingList(householdId)

  const pending = items?.filter((i) => i.status === 'pending') ?? []
  const purchased = items?.filter((i) => i.status === 'purchased') ?? []

  function row(item: ShoppingItem) {
    return (
      <Row
        key={item.id}
        item={item}
        onToggle={() => toggleItem.mutate(item)}
        onUpdateAmount={(amount) => updateAmount.mutate({ id: item.id, amount })}
        amountPlaceholder={t('amountPlaceholder')}
      />
    )
  }

  return (
    <div className="space-y-6">
      <AddItemInput onAdd={(name, amount) => addItem.mutate({ name, amount })} />

      {isLoading && <p className="text-slate-500">{t('loading')}</p>}

      {!isLoading && pending.length === 0 && purchased.length === 0 && (
        <p className="text-slate-500">{t('nothingOnList')}</p>
      )}

      {pending.length > 0 && <ul className="space-y-2">{pending.map(row)}</ul>}

      {purchased.length > 0 && (
        <div>
          <p className="mb-2 text-xs uppercase tracking-wide text-slate-500">{t('checkedOff')}</p>
          <ul className="space-y-2">{purchased.map(row)}</ul>
        </div>
      )}
    </div>
  )
}
