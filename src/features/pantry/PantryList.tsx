import { usePantry } from './usePantry'
import { PantryRow } from './PantryRow'
import { useLanguage } from '@/features/household/useLanguage'

export function PantryList({ householdId }: { householdId: string }) {
  const { t } = useLanguage()
  const { data: items, isLoading, consume, updateAmount, updateExpiry } = usePantry(householdId)

  if (isLoading) return <p className="text-slate-500">{t('loading')}</p>

  if (!items || items.length === 0) {
    return <p className="text-slate-500">{t('pantryEmpty')}</p>
  }

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <PantryRow
          key={item.id}
          item={item}
          onConsume={() => consume.mutate(item.id)}
          onUpdateAmount={(amount) => updateAmount.mutate({ id: item.id, amount })}
          onUpdateExpiry={(expiresAt) => updateExpiry.mutate({ id: item.id, expiresAt })}
        />
      ))}
    </ul>
  )
}
