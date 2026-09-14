import { describe, it, expect } from 'vitest'
import { filterByName } from './filterByName'

const items = [{ name: 'Milk' }, { name: 'Tomatoes' }, { name: 'חלב סויה' }]

describe('filterByName', () => {
  it('matches case-insensitively on a substring', () => {
    expect(filterByName(items, 'milk')).toEqual([{ name: 'Milk' }])
  })

  it('matches Hebrew input the same way', () => {
    expect(filterByName(items, 'סויה')).toEqual([{ name: 'חלב סויה' }])
  })

  it('ignores surrounding whitespace in the query', () => {
    expect(filterByName(items, '  toma ')).toEqual([{ name: 'Tomatoes' }])
  })

  it('returns everything for an empty or blank query', () => {
    expect(filterByName(items, '')).toEqual(items)
    expect(filterByName(items, '   ')).toEqual(items)
  })

  it('returns nothing when no item matches', () => {
    expect(filterByName(items, 'xyz')).toEqual([])
  })
})
