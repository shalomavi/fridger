import { useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { setHouseholdProduceExpiryDays } from '@/features/household/api'
import { useHousehold, useInvalidateHousehold } from '@/features/household/useHousehold'
import { useLanguage } from '@/features/household/useLanguage'
import { useToast } from '@/shared/alerts/ToastContext'
import { Button } from '@/shared/ui/Button'
import { fieldClass } from '@/shared/ui/Input'

/** Days added to today as the expiry of a newly bought produce item (see
 * domain/expiry.ts's defaultExpiry). 0 means no default. */
export function ProduceExpirySettings() {
  const { t } = useLanguage()
  const { data: household } = useHousehold()
  const invalidate = useInvalidateHousehold()
  const { notify } = useToast()
  const [value, setValue] = useState('')
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    if (household && !dirty) setValue(String(household.produce_expiry_days))
  }, [household, dirty])

  const days = Number(value)
  const valid = value !== '' && Number.isInteger(days) && days >= 0 && days <= 365

  const save = useMutation({
    mutationFn: (n: number) => setHouseholdProduceExpiryDays(household!.id, n),
    onSuccess: () => {
      invalidate()
      setDirty(false)
      notify(t('produceExpirySaved'), 'success')
    },
    onError: () => notify(t('actionFailed'), 'error'),
  })

  if (!household) return null

  return (
    <div className="space-y-2">
      <label className="block text-sm text-text-muted">{t('produceExpiryLabel')}</label>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        max={365}
        value={value}
        onChange={(e) => {
          setValue(e.target.value)
          setDirty(true)
        }}
        className={`w-24 px-4 py-2 ${fieldClass}`}
      />
      <div>
        <Button
          onClick={() => save.mutate(days)}
          disabled={!dirty || !valid || save.isPending}
          className="px-5 py-2 text-sm"
        >
          {save.isPending ? '…' : t('save')}
        </Button>
      </div>
    </div>
  )
}
