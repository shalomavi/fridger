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

/** Date-only expiry ('YYYY-MM-DD') for a newly bought item: only produce gets a
 * default, and only when the household's days setting is above 0. */
export function defaultExpiry(
  category: string | null,
  produceExpiryDays: number,
  now: Date = new Date(),
): string | null {
  if (category !== 'produce' || produceExpiryDays <= 0) return null
  const d = new Date(now)
  d.setDate(d.getDate() + produceExpiryDays)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
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
