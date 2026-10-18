import { useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { setHouseholdProduceExpiryDays } from '@/features/household/api'
import { useHousehold, useInvalidateHousehold } from '@/features/household/useHousehold'
import { useLanguage } from '@/features/household/useLanguage'
import { elevationShadow } from '@/shared/ui/elevation'
import { fieldClass } from '@/shared/ui/Input'

const MAX_DAYS = 365

/** Days added to today as the expiry of a newly bought produce item (see
 * domain/expiry.ts's defaultExpiry). 0 means no default. A −/+ stepper that
 * saves on each tap, same as MealTypeSettings and CategoryOrderSettings:
 * each tap is a complete, small change. The number between the buttons is
 * also typeable; typed values save on blur/Enter instead, so half-typed
 * digits aren't saved. */
export function ProduceExpirySettings() {
  const { t } = useLanguage()
  const { data: household } = useHousehold()
  const invalidate = useInvalidateHousehold()
  const [days, setDays] = useState(0)
  const [text, setText] = useState('0')
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    if (household && !dirty) {
      setDays(household.produce_expiry_days)
      setText(String(household.produce_expiry_days))
    }
  }, [household, dirty])

  const save = useMutation({
    mutationFn: (n: number) => setHouseholdProduceExpiryDays(household!.id, n),
    onSuccess: async () => {
      await invalidate()
      setDirty(false)
    },
  })

  function commit(next: number) {
    setText(String(next))
    if (next === days) return
    setDays(next)
    setDirty(true)
    save.mutate(next)
  }

  function change(delta: -1 | 1) {
    commit(Math.min(MAX_DAYS, Math.max(0, days + delta)))
  }

  function commitTyped() {
    const n = Math.round(Number(text))
    commit(text === '' || Number.isNaN(n) ? days : Math.min(MAX_DAYS, Math.max(0, n)))
  }

  if (!household) return null

  const stepClass = `flex h-10 w-10 items-center justify-center rounded-full bg-primary text-xl leading-none text-white transition-transform duration-300 active:scale-90 disabled:opacity-40 ${elevationShadow}`

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg bg-surface px-4 py-3">
      <div className="min-w-0">
        <p className="text-text">{t('category_produce')}</p>
        <p className="text-xs text-text-muted">{t('produceExpiryHint')}</p>
      </div>
      <div className="flex shrink-0 items-center gap-3" dir="ltr">
        <button onClick={() => change(-1)} disabled={days === 0} aria-label="−" className={stepClass}>
          −
        </button>
        <div className="w-16 text-center leading-tight">
          <input
            type="text"
            inputMode="numeric"
            value={text}
            onChange={(e) => setText(e.target.value.replace(/\D/g, '').slice(0, 3))}
            onBlur={commitTyped}
            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
            onFocus={(e) => e.currentTarget.select()}
            aria-label={t('category_produce')}
            className={`w-full py-1 text-center text-lg font-medium ${fieldClass}`}
          />
          <p className="mt-0.5 text-xs text-text-muted">{days === 0 ? t('produceExpiryOff') : t('produceExpiryDays')}</p>
        </div>
        <button onClick={() => change(1)} disabled={days === MAX_DAYS} aria-label="+" className={stepClass}>
          +
        </button>
      </div>
    </div>
  )
}
