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

/** Postgres returns timestamptz as a full ISO string ('2026-09-01T00:00:00+00:00'),
 * but <input type="date"> requires exactly 'YYYY-MM-DD' or it silently shows
 * blank instead of the saved value. Both this and the display format below
 * work off the string directly (no Date/timezone conversion), since the
 * value is always date-only in intent. */
export function toDateInputValue(expiresAt: string | null): string {
  if (!expiresAt) return ''
  return expiresAt.slice(0, 10)
}

/** dd/mm/yyyy, for display only — never fed back into a date input or the DB. */
export function formatDateDisplay(expiresAt: string): string {
  const [year, month, day] = toDateInputValue(expiresAt).split('-')
  return `${day}/${month}/${year}`
}
