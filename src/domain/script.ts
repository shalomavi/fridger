const HEBREW_RANGE = /[֐-׿]/

/**
 * Item names are free-text and can be typed in either language regardless
 * of the household's UI language setting, so the *font* follows the text's
 * own script rather than `lang` — a Hebrew name should render in the Hebrew
 * font even when the UI is set to English, and vice versa.
 */
export function isHebrewText(text: string): boolean {
  return HEBREW_RANGE.test(text)
}
