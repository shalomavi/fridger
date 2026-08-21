import { usePantry } from './usePantry'
import { PantryRow } from './PantryRow'

export function PantryList({ householdId }: { householdId: string }) {
  const { data: items, isLoading, consume } = usePantry(householdId)

  if (isLoading) return <p className="text-slate-500">Loading…</p>

  if (!items || items.length === 0) {
    return <p className="text-slate-500">The pantry is empty. Buy something and check it off.</p>
  }

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <PantryRow key={item.id} item={item} onConsume={() => consume.mutate(item.id)} />
      ))}
    </ul>
  )
}
