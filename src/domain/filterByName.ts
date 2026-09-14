import { normalizeName } from './normalize'

/**
 * Search filter for the shopping list and pantry: substring match on the
 * normalized name (lowercase, trim, collapsed whitespace — same rule as
 * `normalizeName`, so it works the same for mixed Hebrew/English input).
 * An empty/whitespace-only query matches everything.
 */
export function filterByName<T extends { name: string }>(items: T[], query: string): T[] {
  const needle = normalizeName(query)
  if (!needle) return items
  return items.filter((item) => normalizeName(item.name).includes(needle))
}
