import { useMutation } from '@tanstack/react-query'
import { setHouseholdLanguage, type Language } from './api'
import { useHousehold, useInvalidateHousehold } from './useHousehold'
import { t, type TKey } from '@/shared/i18n'

/** The household's language, a `t()` bound to it, and a setter. Defaults to
 * English before a household exists (auth/setup screens are English-only). */
export function useLanguage() {
  const { data: household } = useHousehold()
  const invalidate = useInvalidateHousehold()
  const lang: Language = household?.language ?? 'en'

  const setLanguage = useMutation({
    mutationFn: (next: Language) => setHouseholdLanguage(household!.id, next),
    onSuccess: () => invalidate(),
  })

  return { lang, t: (key: TKey) => t(lang, key), setLanguage }
}
