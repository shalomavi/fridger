import { normalizeName } from './normalize'

/**
 * Autocomplete source for SearchInput: distinct item names already in the
 * list being searched (shopping list — any status — or pantry), so typing
 * in the search box can complete to an exact existing name instead of a
 * blind substring guess. Deduped via normalizeName (same rule as
 * filterByName), first occurrence's casing kept.
 */
export function itemNameSuggestions<T extends { name: string }>(items: T[]): string[] {
  const seen = new Set<string>()
  const suggestions: string[] = []
  for (const item of items) {
    const key = normalizeName(item.name)
    if (seen.has(key)) continue
    seen.add(key)
    suggestions.push(item.name)
  }
  return suggestions
}
