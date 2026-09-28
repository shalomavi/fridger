import { useMutation } from '@tanstack/react-query'
import { parseRecipeFromText } from './api'
import type { Language } from '@/shared/i18n'

/** Wraps the parse-recipe call for pasted text. Image/url variants (later
 * slices) get their own thin wrapper here calling their own api.ts
 * function, same shape. */
export function useParseRecipeFromText(householdId: string) {
  return useMutation({
    mutationFn: ({ lang, text }: { lang: Language; text: string }) => parseRecipeFromText(householdId, lang, text),
  })
}
