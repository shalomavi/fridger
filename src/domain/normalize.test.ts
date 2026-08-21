import { describe, it, expect } from 'vitest'
import { normalizeName, isSameIngredient } from './normalize'

describe('normalizeName', () => {
  it('lowercases and trims', () => {
    expect(normalizeName('  Tomatoes ')).toBe('tomatoes')
  })

  it('collapses internal whitespace', () => {
    expect(normalizeName('olive   oil')).toBe('olive oil')
  })

  it('leaves Hebrew untouched apart from whitespace', () => {
    expect(normalizeName('  עגבניות  ')).toBe('עגבניות')
  })

  it('does not singularize — "tomatoes" and "tomato" stay distinct', () => {
    // Intentional: singularization breaks Hebrew. Duplicates are acceptable.
    expect(isSameIngredient('tomatoes', 'tomato')).toBe(false)
  })
})

describe('isSameIngredient', () => {
  it('matches across casing and padding', () => {
    expect(isSameIngredient('Milk', ' milk')).toBe(true)
  })
})
