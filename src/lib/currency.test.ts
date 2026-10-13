import { describe, expect, it } from 'vitest'
import {
  formatCompactCurrency,
  formatCurrency,
  parseCurrency,
  sanitizeCurrency,
  sanitizeCurrencyNumber,
  terbilangRupiah,
} from './currency'

describe('Currency Utilities', () => {
  describe('parseCurrency', () => {
    it('handles numeric input', () => {
      expect(parseCurrency(1000000)).toBe(1000000)
      expect(parseCurrency(0)).toBe(0)
    })

    it('handles standard formatted strings with dots', () => {
      expect(parseCurrency('1.000.000')).toBe(1000000)
      expect(parseCurrency('Rp 1.000.000')).toBe(1000000)
      expect(parseCurrency('Rp. 2.500.000')).toBe(2500000)
      expect(parseCurrency('50.000')).toBe(50000)
    })

    it('handles raw unformatted numeric strings', () => {
      expect(parseCurrency('1000000')).toBe(1000000)
      expect(parseCurrency('1500000')).toBe(1500000)
    })

    it('parses shorthand notations (1jt, 1.5jt, 500k, 100rb)', () => {
      expect(parseCurrency('1jt')).toBe(1000000)
      expect(parseCurrency('1 jt')).toBe(1000000)
      expect(parseCurrency('1.5jt')).toBe(1500000)
      expect(parseCurrency('1,5jt')).toBe(1500000)
      expect(parseCurrency('2.5 juta')).toBe(2500000)
      expect(parseCurrency('500k')).toBe(500000)
      expect(parseCurrency('100rb')).toBe(100000)
      expect(parseCurrency('250 ribu')).toBe(250000)
      expect(parseCurrency('2m')).toBe(2000000000)
      expect(parseCurrency('1,2 M')).toBe(1200000000)
      expect(parseCurrency('1 miliar')).toBe(1000000000)
      expect(parseCurrency('1t')).toBe(1000000000000)
    })

    it('handles empty and null values gracefully', () => {
      expect(parseCurrency('')).toBe(0)
      expect(parseCurrency(null)).toBe(0)
      expect(parseCurrency(undefined)).toBe(0)
      expect(parseCurrency('random text')).toBe(0)
    })
  })

  describe('formatCurrency', () => {
    it('formats numbers with thousand separator dots', () => {
      expect(formatCurrency(1000000)).toBe('1.000.000')
      expect(formatCurrency('1000000')).toBe('1.000.000')
      expect(formatCurrency(50000)).toBe('50.000')
    })

    it('formats with Rp prefix when requested', () => {
      expect(formatCurrency(1000000, { withPrefix: true })).toBe('Rp 1.000.000')
    })

    it('handles empty and null values', () => {
      expect(formatCurrency('')).toBe('')
      expect(formatCurrency(null)).toBe('')
    })
  })

  describe('formatCompactCurrency', () => {
    it('converts amounts into compact terms (1jt, 1,5jt, 500rb, 2,5 M)', () => {
      expect(formatCompactCurrency(1000000)).toBe('1 jt')
      expect(formatCompactCurrency('1000000')).toBe('1 jt')
      expect(formatCompactCurrency(1500000)).toBe('1,5 jt')
      expect(formatCompactCurrency(500000)).toBe('500 rb')
      expect(formatCompactCurrency(100000)).toBe('100 rb')
      expect(formatCompactCurrency(2500000000)).toBe('2,5 M')
      expect(formatCompactCurrency(1000000000000)).toBe('1 T')
    })

    it('supports prefix and uppercase options', () => {
      expect(
        formatCompactCurrency(1000000, { withPrefix: true, uppercase: true }),
      ).toBe('Rp 1 JT')
    })

    it('handles small amounts and 0', () => {
      expect(formatCompactCurrency(500)).toBe('500')
      expect(formatCompactCurrency(0)).toBe('0')
      expect(formatCompactCurrency(null)).toBe('')
    })
  })

  describe('sanitizeCurrency', () => {
    it('sanitizes formatted and shorthand strings for backend submission', () => {
      expect(sanitizeCurrency('1.000.000')).toBe('1000000')
      expect(sanitizeCurrency('Rp 1.000.000')).toBe('1000000')
      expect(sanitizeCurrency('1jt')).toBe('1000000')
      expect(sanitizeCurrency('1.5jt')).toBe('1500000')
      expect(sanitizeCurrency('500k')).toBe('500000')
      expect(sanitizeCurrency(1000000)).toBe('1000000')
    })

    it('formats to fixed decimals when requested (e.g. backend decimal 20,2)', () => {
      expect(sanitizeCurrency('1.000.000', { toFixed: 2 })).toBe('1000000.00')
      expect(sanitizeCurrency('1.5jt', { toFixed: 2 })).toBe('1500000.00')
    })

    it('returns empty string for empty inputs', () => {
      expect(sanitizeCurrency('')).toBe('')
      expect(sanitizeCurrency(null)).toBe('')
      expect(sanitizeCurrency('invalid')).toBe('')
    })
  })

  describe('sanitizeCurrencyNumber', () => {
    it('returns clean number', () => {
      expect(sanitizeCurrencyNumber('1.000.000')).toBe(1000000)
      expect(sanitizeCurrencyNumber('1jt')).toBe(1000000)
      expect(sanitizeCurrencyNumber('')).toBe(0)
    })
  })

  describe('terbilangRupiah', () => {
    it('converts amount to Indonesian words', () => {
      expect(terbilangRupiah(1000000)).toBe('Satu Juta Rupiah')
      expect(terbilangRupiah(1500000)).toBe('Satu Juta Lima Ratus Ribu Rupiah')
      expect(terbilangRupiah(50000)).toBe('Lima Puluh Ribu Rupiah')
      expect(terbilangRupiah(0)).toBe('Nol Rupiah')
    })
  })
})
