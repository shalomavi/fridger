/**
 * Plain-text rendering of a meal's ingredients + steps, for sharing outside
 * the app (WhatsApp, clipboard, etc). Pure and framework-free so it's easy
 * to unit test — no rendering, no side effects. Labels are passed in rather
 * than read from i18n directly, keeping this file free of app-level imports.
 */

import { formatQuantity, type Unit } from './units'

export type ShareableMeal = {
  name: string
  uses: { name: string; quantity: number; unit: Unit }[]
  missing: { name: string; quantity: number; unit: Unit }[]
  steps: string[]
}

export function formatMealShareText(
  meal: ShareableMeal,
  labels: { uses: string; alsoNeed: string },
  unitLabels: Record<Unit, string>,
): string {
  const lines = [meal.name, '']

  if (meal.uses.length > 0) {
    lines.push(
      `${labels.uses} ${meal.uses.map((u) => `${u.name} ${formatQuantity(u.quantity, u.unit, unitLabels[u.unit])}`).join(', ')}`,
    )
  }
  if (meal.missing.length > 0) {
    lines.push(
      `${labels.alsoNeed} ${meal.missing.map((m) => `${m.name} ${formatQuantity(m.quantity, m.unit, unitLabels[m.unit])}`).join(', ')}`,
    )
  }
  if (meal.uses.length > 0 || meal.missing.length > 0) {
    lines.push('')
  }

  meal.steps.forEach((step, i) => lines.push(`${i + 1}. ${step}`))

  return lines.join('\n')
}
