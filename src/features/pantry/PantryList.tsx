import { usePantry } from './usePantry'
import { PantryRow } from './PantryRow'
import { useLanguage } from '@/features/household/useLanguage'

export function PantryList({ householdId }: { householdId: string }) {
  const { t } = useLanguage()
  const { data: items, isLoading, consume } = usePantry(householdId)

  if (isLoading) return <p className="text-slate-500">{t('loading')}</p>

  if (!items || items.length === 0) {
    return <p className="text-slate-500">{t('pantryEmpty')}</p>
  }

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <PantryRow key={item.id} item={item} onConsume={() => consume.mutate(item.id)} />
      ))}
    </ul>
  )
}
