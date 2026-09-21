import { normalizeName } from './normalize'

/**
 * Autocomplete source for AddItemInput: names of previously checked-off
 * (purchased) shopping items, so re-adding something you've bought before
 * is a pick from history rather than retyping. One entry per ingredient
 * (deduped via normalizeName, same rule as filterByName), most recently
 * purchased first, casing taken from that most recent occurrence.
 */
export function purchaseSuggestions<T extends { name: string; status: string; purchased_at: string | null }>(
  items: T[],
): string[] {
  const purchased = items
    .filter((i) => i.status === 'purchased')
    .sort((a, b) => (b.purchased_at ?? '').localeCompare(a.purchased_at ?? ''))

  const seen = new Set<string>()
  const suggestions: string[] = []
  for (const item of purchased) {
    const key = normalizeName(item.name)
    if (seen.has(key)) continue
    seen.add(key)
    suggestions.push(item.name)
  }
  return suggestions
}
