import { describe, it, expect } from 'vitest'
import { formatMealShareText } from './formatMealShareText'

const labels = { uses: 'Uses:', alsoNeed: "You'll also need:" }

describe('formatMealShareText', () => {
  it('includes name, uses, missing, and numbered steps', () => {
    const text = formatMealShareText(
      {
        name: 'Shakshuka',
        uses: ['eggs', 'tomatoes'],
        missing: ['bread'],
        steps: ['Fry onions', 'Add tomatoes and eggs'],
      },
      labels,
    )

    expect(text).toBe(
      [
        'Shakshuka',
        '',
        'Uses: eggs, tomatoes',
        "You'll also need: bread",
        '',
        '1. Fry onions',
        '2. Add tomatoes and eggs',
      ].join('\n'),
    )
  })

  it('omits uses/missing lines entirely when both are empty', () => {
    const text = formatMealShareText({ name: 'Toast', uses: [], missing: [], steps: ['Toast it'] }, labels)

    expect(text).toBe(['Toast', '', '1. Toast it'].join('\n'))
  })
})
