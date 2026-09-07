/**
 * Buckets items by category, in the given order, dropping empty buckets.
 * Uncategorized items (category is null, or not found in `order`) come
 * back as one trailing group with `category: null`.
 */
export type CategoryGroup<T> = { category: string | null; items: T[] }

export function groupByCategory<T extends { category: string | null }>(
  items: T[],
  order: readonly string[],
): CategoryGroup<T>[] {
  const buckets = new Map<string, T[]>(order.map((category) => [category, []]))
  const uncategorized: T[] = []

  for (const item of items) {
    const bucket = item.category ? buckets.get(item.category) : undefined
    if (bucket) bucket.push(item)
    else uncategorized.push(item)
  }

  const groups: CategoryGroup<T>[] = order
    .filter((category) => buckets.get(category)!.length > 0)
    .map((category) => ({ category, items: buckets.get(category)! }))

  if (uncategorized.length > 0) groups.push({ category: null, items: uncategorized })
  return groups
}
