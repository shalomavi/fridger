/**
 * What counts as "expiring soon" — used both to highlight pantry rows and
 * (duplicated, same threshold — see suggest-meals/schema.ts) to flag items
 * in the LLM prompt as "use these first".
 */
const EXPIRING_SOON_DAYS = 3

export function isExpiringSoon(expiresAt: string | null, now: Date = new Date()): boolean {
  if (!expiresAt) return false
  return daysUntil(expiresAt, now) <= EXPIRING_SOON_DAYS
}

export function daysUntil(expiresAt: string, now: Date = new Date()): number {
  const diffMs = new Date(expiresAt).getTime() - now.getTime()
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}
