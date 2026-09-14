import type { Meal } from './api'
import { formatMealShareText } from '@/domain/formatMealShareText'
import type { Language } from '@/shared/i18n'
import { t } from '@/shared/i18n'

/**
 * Copies the meal's ingredients + steps to the clipboard, then opens
 * WhatsApp (app on mobile via the wa.me deep link, web.whatsapp.com as its
 * fallback in a desktop browser) with that same text pre-filled. Clipboard
 * write is best-effort — some browsers require a user gesture or HTTPS, and
 * this is called from one (the share button's onClick), but we still don't
 * want a clipboard failure to block opening WhatsApp.
 */
export async function shareMealToWhatsApp(meal: Meal, lang: Language): Promise<void> {
  const text = formatMealShareText(meal, { uses: t(lang, 'uses'), alsoNeed: t(lang, 'alsoNeed') })

  try {
    await navigator.clipboard.writeText(text)
  } catch {
    // Clipboard permission denied or unavailable — WhatsApp still gets the
    // text pre-filled below, so this is not fatal.
  }

  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener')
}
