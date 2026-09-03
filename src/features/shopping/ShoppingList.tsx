import { useShoppingList } from './useShoppingList'
import { AddItemInput } from './AddItemInput'
import type { ShoppingItem } from './api'
import { useLanguage } from '@/features/household/useLanguage'
import { AmountEditor } from '@/shared/ui/AmountEditor'
import { Surface } from '@/shared/ui/Surface'

function DeleteButton({ onDelete, label, confirmMessage }: { onDelete: () => void; label: string; confirmMessage: string }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        if (window.confirm(confirmMessage)) onDelete()
      }}
      aria-label={label}
      className="flex-none p-1 text-text-subtle"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M4 7h16" />
        <path d="M6 7V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" />
        <path d="M19 7l-1 13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 7" />
      </svg>
    </button>
  )
}

function Row({
  item,
  onToggle,
  onUpdateAmount,
  onDelete,
  amountPlaceholder,
  deleteLabel,
  confirmDeleteMessage,
}: {
  item: ShoppingItem
  onToggle: () => void
  onUpdateAmount: (amount: string | null) => void
  onDelete: () => void
  amountPlaceholder: string
  deleteLabel: string
  confirmDeleteMessage: string
}) {
  const { lang } = useLanguage()
  const purchased = item.status === 'purchased'
  return (
    <Surface as="li" className="flex items-center gap-2 pe-4">
      <button
        onClick={onToggle}
        className="flex flex-1 items-center gap-3 px-4 py-3 text-start"
      >
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
      <AmountEditor amount={item.amount} onSave={onUpdateAmount} placeholder={amountPlaceholder} />
      <DeleteButton onDelete={onDelete} label={deleteLabel} confirmMessage={confirmDeleteMessage} />
    </Surface>
  )
}

export function ShoppingList({ householdId }: { householdId: string }) {
  const { t } = useLanguage()
  const { data: items, isLoading, addItem, toggleItem, updateAmount, deleteItem } =
    useShoppingList(householdId)

  const pending = items?.filter((i) => i.status === 'pending') ?? []
  const purchased = items?.filter((i) => i.status === 'purchased') ?? []

  function row(item: ShoppingItem) {
    return (
      <Row
        key={item.id}
        item={item}
        onToggle={() => toggleItem.mutate(item)}
        onUpdateAmount={(amount) => updateAmount.mutate({ id: item.id, amount })}
        onDelete={() => deleteItem.mutate(item.id)}
        amountPlaceholder={t('amountPlaceholder')}
        deleteLabel={t('deleteItem')}
        confirmDeleteMessage={t('confirmDeleteItem')}
      />
    )
  }

  return (
    <div className="space-y-6">
      <AddItemInput onAdd={(name, amount) => addItem.mutate({ name, amount })} />

      {isLoading && <p className="text-text-subtle">{t('loading')}</p>}

      {!isLoading && pending.length === 0 && purchased.length === 0 && (
        <p className="text-text-subtle">{t('nothingOnList')}</p>
      )}

      {pending.length > 0 && <ul className="space-y-2">{pending.map(row)}</ul>}

      {purchased.length > 0 && (
        <div>
          <p className="mb-2 text-xs uppercase tracking-wide text-text-subtle">{t('checkedOff')}</p>
          <ul className="space-y-2">{purchased.map(row)}</ul>
        </div>
      )}
    </div>
  )
}
