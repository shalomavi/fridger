/**
 * Ingredient name normalization.
 *
 * Deliberately minimal: lowercase, trim, collapse whitespace. Nothing else.
 * Input is mixed Hebrew/English, so English singularization would corrupt
 * Hebrew names. Do not add stemming, synonyms, or an ingredient taxonomy here
 * — see CLAUDE.md.
 */
export function normalizeName(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, ' ')
}

/** True when two raw names refer to the same ingredient for our purposes. */
export function isSameIngredient(a: string, b: string): boolean {
  return normalizeName(a) === normalizeName(b)
}
