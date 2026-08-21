import { useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { setHouseholdPreferences } from '@/features/household/api'
import { useHousehold, useInvalidateHousehold } from '@/features/household/useHousehold'
import { useLanguage } from '@/features/household/useLanguage'
import { Button } from '@/shared/ui/Button'

export function HouseholdPreferences() {
  const { t } = useLanguage()
  const { data: household } = useHousehold()
  const invalidate = useInvalidateHousehold()
  const [value, setValue] = useState('')
  const [dirty, setDirty] = useState(false)

  // Sync local state from the fetched household once, not on every re-fetch —
  // otherwise the 5s poll would stomp on whatever the user is mid-typing.
  useEffect(() => {
    if (household && !dirty) setValue(household.preferences ?? '')
  }, [household, dirty])

  const save = useMutation({
    mutationFn: (text: string) => setHouseholdPreferences(household!.id, text),
    onSuccess: () => {
      invalidate()
      setDirty(false)
    },
  })

  if (!household) return null

  return (
    <div className="space-y-2">
      <label className="block text-sm text-text-muted">{t('preferencesLabel')}</label>
      <textarea
        value={value}
        onChange={(e) => {
          setValue(e.target.value)
          setDirty(true)
        }}
        placeholder={t('preferencesPlaceholder')}
        rows={4}
        className="w-full resize-none rounded-lg bg-surface px-4 py-3 text-text outline-none focus:ring-2 focus:ring-primary-ring"
      />
      <Button onClick={() => save.mutate(value)} disabled={!dirty || save.isPending} className="px-5 py-2 text-sm">
        {save.isPending ? '…' : t('save')}
      </Button>
    </div>
  )
}
