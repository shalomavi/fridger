/**
 * Combines two free-text amounts when the same ingredient shows up twice —
 * adding "Milk" to the list when it's already pending, or buying milk while
 * some is still in the pantry. Pure text join, no unit parsing/conversion:
 * see CLAUDE.md — "amount" stays a single free-text field on purpose.
 */
export function mergeAmount(existing: string | null, incoming: string | null): string | null {
  const a = existing?.trim() || null
  const b = incoming?.trim() || null
  if (!a) return b
  if (!b) return a
  if (a === b) return a
  return `${a}, ${b}`
}
