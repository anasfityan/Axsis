import { describe, expect, it } from 'vitest'
import { directionForLocale, translations } from './translations'

describe('translations', () => {
  it('keeps the same keys for all supported locales', () => {
    const arabicKeys = Object.keys(translations.ar).sort()
    expect(Object.keys(translations.tr).sort()).toEqual(arabicKeys)
    expect(Object.keys(translations.en).sort()).toEqual(arabicKeys)
  })

  it('uses RTL only for Arabic', () => {
    expect(directionForLocale('ar')).toBe('rtl')
    expect(directionForLocale('tr')).toBe('ltr')
    expect(directionForLocale('en')).toBe('ltr')
  })
})
