import { useMutation } from '@tanstack/react-query'
import { parseRecipeFromText, parseRecipeFromImage } from './api'
import type { Language } from '@/shared/i18n'

/** Wraps the parse-recipe call for pasted text. The url variant (later
 * slice) gets its own thin wrapper here calling its own api.ts function,
 * same shape. */
export function useParseRecipeFromText(householdId: string) {
  return useMutation({
    mutationFn: ({ lang, text }: { lang: Language; text: string }) => parseRecipeFromText(householdId, lang, text),
  })
}

export function useParseRecipeFromImage(householdId: string) {
  return useMutation({
    mutationFn: ({ lang, imageBase64 }: { lang: Language; imageBase64: string }) =>
      parseRecipeFromImage(householdId, lang, imageBase64),
  })
}
