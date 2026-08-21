import { useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { setHouseholdPreferences } from '@/features/household/api'
import { useHousehold, useInvalidateHousehold } from '@/features/household/useHousehold'
import { useLanguage } from '@/features/household/useLanguage'

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
      <label className="block text-sm text-slate-400">{t('preferencesLabel')}</label>
      <textarea
        value={value}
        onChange={(e) => {
          setValue(e.target.value)
          setDirty(true)
        }}
        placeholder={t('preferencesPlaceholder')}
        rows={4}
        className="w-full resize-none rounded-lg bg-slate-800 px-4 py-3 text-slate-100 outline-none focus:ring-2 focus:ring-teal-500"
      />
      <button
        onClick={() => save.mutate(value)}
        disabled={!dirty || save.isPending}
        className="rounded-lg bg-teal-600 px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {save.isPending ? '…' : t('save')}
      </button>
    </div>
  )
}
