import { useShoppingList } from './useShoppingList'
import { AddItemInput } from './AddItemInput'
import type { ShoppingItem } from './api'

function Row({ item, onToggle }: { item: ShoppingItem; onToggle: () => void }) {
  const purchased = item.status === 'purchased'
  return (
    <li>
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-3 rounded-lg bg-slate-800 px-4 py-3 text-left"
      >
        <span
          className={`h-5 w-5 flex-none rounded-full border-2 ${
            purchased ? 'border-teal-500 bg-teal-500' : 'border-slate-500'
          }`}
        />
        <span className={purchased ? 'text-slate-500 line-through' : 'text-slate-100'}>
          {item.name}
        </span>
      </button>
    </li>
  )
}

export function ShoppingList({ householdId }: { householdId: string }) {
  const { data: items, isLoading, addItem, toggleItem } = useShoppingList(householdId)

  const pending = items?.filter((i) => i.status === 'pending') ?? []
  const purchased = items?.filter((i) => i.status === 'purchased') ?? []

  return (
    <div className="space-y-6">
      <AddItemInput onAdd={(name) => addItem.mutate(name)} />

      {isLoading && <p className="text-slate-500">Loading…</p>}

      {!isLoading && pending.length === 0 && purchased.length === 0 && (
        <p className="text-slate-500">Nothing on the list yet.</p>
      )}

      {pending.length > 0 && (
        <ul className="space-y-2">
          {pending.map((item) => (
            <Row key={item.id} item={item} onToggle={() => toggleItem.mutate(item)} />
          ))}
        </ul>
      )}

      {purchased.length > 0 && (
        <div>
          <p className="mb-2 text-xs uppercase tracking-wide text-slate-500">Checked off</p>
          <ul className="space-y-2">
            {purchased.map((item) => (
              <Row key={item.id} item={item} onToggle={() => toggleItem.mutate(item)} />
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
