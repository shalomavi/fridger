import { describe, it, expect } from 'vitest'
import { t } from './index'
import { en } from './en'
import { he } from './he'

describe('t', () => {
  it('reads the matching key from the English dictionary', () => {
    expect(t('en', 'add')).toBe(en.add)
    expect(t('en', 'unit_kg')).toBe('kg')
  })

  it('reads the matching key from the Hebrew dictionary', () => {
    expect(t('he', 'add')).toBe(he.add)
    expect(t('he', 'unit_kg')).toBe('ק"ג')
  })

  it('returns a different string per language for the same key', () => {
    expect(t('en', 'save')).not.toBe(t('he', 'save'))
  })
})

describe('en/he key parity', () => {
  it('has a Hebrew translation for every English key, and no extras', () => {
    const enKeys = Object.keys(en).sort()
    const heKeys = Object.keys(he).sort()
    expect(heKeys).toEqual(enKeys)
  })

  it('has no empty translations on either side', () => {
    for (const key of Object.keys(en) as (keyof typeof en)[]) {
      expect(en[key], `en.${key}`).not.toBe('')
      expect(he[key], `he.${key}`).not.toBe('')
    }
  })

  it('keeps every UNITS entry translated on both sides', () => {
    const units = ['count', 'g', 'kg', 'ml', 'l'] as const
    for (const unit of units) {
      expect(en[`unit_${unit}`]).toBeTruthy()
      expect(he[`unit_${unit}`]).toBeTruthy()
    }
  })
})
