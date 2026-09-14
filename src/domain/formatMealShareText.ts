/**
 * Plain-text rendering of a meal's ingredients + steps, for sharing outside
 * the app (WhatsApp, clipboard, etc). Pure and framework-free so it's easy
 * to unit test — no rendering, no side effects. Labels are passed in rather
 * than read from i18n directly, keeping this file free of app-level imports.
 */

export type ShareableMeal = {
  name: string
  uses: string[]
  missing: string[]
  steps: string[]
}

export function formatMealShareText(
  meal: ShareableMeal,
  labels: { uses: string; alsoNeed: string },
): string {
  const lines = [meal.name, '']

  if (meal.uses.length > 0) {
    lines.push(`${labels.uses} ${meal.uses.join(', ')}`)
  }
  if (meal.missing.length > 0) {
    lines.push(`${labels.alsoNeed} ${meal.missing.join(', ')}`)
  }
  if (meal.uses.length > 0 || meal.missing.length > 0) {
    lines.push('')
  }

  meal.steps.forEach((step, i) => lines.push(`${i + 1}. ${step}`))

  return lines.join('\n')
}
