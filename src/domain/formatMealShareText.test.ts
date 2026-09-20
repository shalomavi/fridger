import { describe, it, expect } from 'vitest'
import { formatMealShareText } from './formatMealShareText'

const labels = { uses: 'Uses:', alsoNeed: "You'll also need:" }
const unitLabels = { count: 'Count', g: 'g', kg: 'kg', ml: 'ml', l: 'L' }

describe('formatMealShareText', () => {
  it('includes name, uses, missing, and numbered steps', () => {
    const text = formatMealShareText(
      {
        name: 'Shakshuka',
        uses: [
          { name: 'eggs', quantity: 2, unit: 'count' },
          { name: 'tomatoes', quantity: 3, unit: 'count' },
        ],
        missing: ['bread'],
        steps: ['Fry onions', 'Add tomatoes and eggs'],
      },
      labels,
      unitLabels,
    )

    expect(text).toBe(
      [
        'Shakshuka',
        '',
        'Uses: eggs ×2, tomatoes ×3',
        "You'll also need: bread",
        '',
        '1. Fry onions',
        '2. Add tomatoes and eggs',
      ].join('\n'),
    )
  })

  it('omits uses/missing lines entirely when both are empty', () => {
    const text = formatMealShareText(
      { name: 'Toast', uses: [], missing: [], steps: ['Toast it'] },
      labels,
      unitLabels,
    )

    expect(text).toBe(['Toast', '', '1. Toast it'].join('\n'))
  })
})
