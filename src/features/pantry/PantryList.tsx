import { usePantry } from './usePantry'

export function PantryList({ householdId }: { householdId: string }) {
  const { data: items, isLoading } = usePantry(householdId)

  if (isLoading) return <p className="text-slate-500">Loading…</p>

  if (!items || items.length === 0) {
    return <p className="text-slate-500">The pantry is empty. Buy something and check it off.</p>
  }

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li
          key={item.id}
          className="flex items-center justify-between rounded-lg bg-slate-800 px-4 py-3"
        >
          <span className="text-slate-100">{item.name}</span>
          {item.amount && <span className="text-sm text-slate-500">{item.amount}</span>}
        </li>
      ))}
    </ul>
  )
}
