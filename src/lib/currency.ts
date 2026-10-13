/**
 * Currency utilities for formatting, parsing shorthand (e.g. 1jt, 500k),
 * compact representation (1.000.000 -> 1 jt), and backend sanitization.
 */

export interface FormatCurrencyOptions {
  readonly withPrefix?: boolean
  readonly decimals?: number
}

export interface FormatCompactOptions {
  readonly withPrefix?: boolean
  readonly uppercase?: boolean
}

export interface SanitizeCurrencyOptions {
  readonly toFixed?: number
}

/**
 * Multipliers for Indonesian & common financial shorthand suffixes.
 */
const SHORTHAND_MULTIPLIERS: Record<string, number> = {
  k: 1_000,
  rb: 1_000,
  ribu: 1_000,
  jt: 1_000_000,
  juta: 1_000_000,
  mio: 1_000_000,
  million: 1_000_000,
  m: 1_000_000_000, // In Indonesian financial contexts, 'M' represents Miliar (10^9)
  miliar: 1_000_000_000,
  milyar: 1_000_000_000,
  b: 1_000_000_000,
  bn: 1_000_000_000,
  billion: 1_000_000_000,
  t: 1_000_000_000_000,
  triliun: 1_000_000_000_000,
  trillion: 1_000_000_000_000,
}

/**
 * Parse any currency input (number, formatted string, shorthand like '1jt', '500k', '1.5jt')
 * into a valid JavaScript number.
 */
export function parseCurrency(
  input: number | string | null | undefined,
): number {
  if (input === null || input === undefined || input === '') {
    return 0
  }

  if (typeof input === 'number') {
    return Number.isFinite(input) ? input : 0
  }

  const raw = input.trim().toLowerCase()
  if (!raw) return 0

  // Strip prefix 'rp', 'rp.' and whitespace
  const stripped = raw.replace(/^rp\.?\s*/i, '').trim()
  if (!stripped) return 0

  // 1. Check if string matches shorthand notation, e.g. "1jt", "1.5jt", "1,5jt", "500k", "100rb"
  const shorthandMatch = stripped.match(/^([0-9]+(?:[.,][0-9]+)?)\s*([a-z]+)$/i)

  if (shorthandMatch) {
    const numPart = shorthandMatch[1]?.replace(',', '.') ?? '0'
    const suffix = shorthandMatch[2]?.toLowerCase() ?? ''
    const baseNumber = parseFloat(numPart)

    if (!Number.isNaN(baseNumber) && suffix in SHORTHAND_MULTIPLIERS) {
      const multiplier = SHORTHAND_MULTIPLIERS[suffix] ?? 1
      return Math.round(baseNumber * multiplier)
    }
  }

  // 2. Parse standard currency formatted string (e.g. "1.000.000", "1.000.000,50", "1500000")
  // Check if string contains both dot and comma
  const hasDot = stripped.includes('.')
  const hasComma = stripped.includes(',')

  let normalized = stripped

  if (hasDot && hasComma) {
    // Indonesian format: dot is thousand separator, comma is decimal (e.g. 1.000.000,50)
    normalized = stripped.replace(/\./g, '').replace(',', '.')
  } else if (hasComma) {
    // Only comma: comma is decimal separator (e.g. 1500,50)
    normalized = stripped.replace(',', '.')
  } else if (hasDot) {
    // Only dot(s):
    const dotsCount = (stripped.match(/\./g) ?? []).length
    if (dotsCount > 1) {
      // Multiple dots: definitely thousand separators (e.g. 1.000.000)
      normalized = stripped.replace(/\./g, '')
    } else {
      // Single dot: e.g. "1.000" vs "10.5"
      const parts = stripped.split('.')
      const afterDot = parts[1] ?? ''
      // If 3 digits after dot, treat as thousand separator (e.g. 1.000, 50.000)
      if (afterDot.length === 3) {
        normalized = stripped.replace('.', '')
      } else {
        // Otherwise treat as decimal point (e.g. 10.5)
        normalized = stripped
      }
    }
  }

  // Remove any remaining unwanted non-numeric characters (except minus & dot)
  const cleaned = normalized.replace(/[^\d.-]/g, '')
  const result = parseFloat(cleaned)
  return Number.isFinite(result) ? result : 0
}

/**
 * Format a number or numeric string to Indonesian Rupiah standard format (dot as thousand separator).
 * E.g. 1000000 -> "1.000.000" (or "Rp 1.000.000" if withPrefix: true)
 */
export function formatCurrency(
  val: number | string | null | undefined,
  options?: FormatCurrencyOptions,
): string {
  if (val === null || val === undefined || val === '') {
    return ''
  }

  const num = typeof val === 'number' ? val : parseCurrency(val)
  if (!Number.isFinite(num)) return ''

  const { withPrefix = false, decimals = 0 } = options ?? {}

  const formatted = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num)

  return withPrefix ? `Rp ${formatted}` : formatted
}

/**
 * Convert nominal amount into compact Indonesian terms.
 * E.g.:
 * - 1.000.000 -> "1 jt"
 * - 1.500.000 -> "1,5 jt"
 * - 500.000 -> "500 rb"
 * - 2.500.000.000 -> "2,5 M"
 * - 1.000.000.000.000 -> "1 T"
 */
export function formatCompactCurrency(
  val: number | string | null | undefined,
  options?: FormatCompactOptions,
): string {
  if (val === null || val === undefined || val === '') {
    return ''
  }

  const num = typeof val === 'number' ? val : parseCurrency(val)
  if (!Number.isFinite(num) || num === 0) return '0'

  const abs = Math.abs(num)
  const sign = num < 0 ? '-' : ''
  const { withPrefix = false, uppercase = false } = options ?? {}

  let formattedValue = ''

  if (abs >= 1_000_000_000_000) {
    const compact = (abs / 1_000_000_000_000).toLocaleString('id-ID', {
      maximumFractionDigits: 1,
    })
    formattedValue = `${compact} ${uppercase ? 'T' : 'T'}`
  } else if (abs >= 1_000_000_000) {
    const compact = (abs / 1_000_000_000).toLocaleString('id-ID', {
      maximumFractionDigits: 1,
    })
    formattedValue = `${compact} ${uppercase ? 'M' : 'M'}`
  } else if (abs >= 1_000_000) {
    const compact = (abs / 1_000_000).toLocaleString('id-ID', {
      maximumFractionDigits: 1,
    })
    formattedValue = `${compact} ${uppercase ? 'JT' : 'jt'}`
  } else if (abs >= 1_000) {
    const compact = (abs / 1_000).toLocaleString('id-ID', {
      maximumFractionDigits: 1,
    })
    formattedValue = `${compact} ${uppercase ? 'RB' : 'rb'}`
  } else {
    formattedValue = abs.toLocaleString('id-ID', {
      maximumFractionDigits: 0,
    })
  }

  const result = `${sign}${formattedValue}`
  return withPrefix ? `Rp ${result}` : result
}

/**
 * Sanitize currency value into a clean numeric string for backend submission.
 * Handles inputs like "1.000.000", "Rp 1.000.000", "1jt", "1.5jt", "500k".
 *
 * Example:
 * - sanitizeCurrency("1.000.000") => "1000000"
 * - sanitizeCurrency("1.000.000", { toFixed: 2 }) => "1000000.00"
 * - sanitizeCurrency("1.5jt", { toFixed: 2 }) => "1500000.00"
 * - sanitizeCurrency("") => ""
 */
export function sanitizeCurrency(
  val: number | string | null | undefined,
  options?: SanitizeCurrencyOptions,
): string {
  if (val === null || val === undefined || val === '') {
    return ''
  }

  const num = typeof val === 'number' ? val : parseCurrency(val)
  if (!Number.isFinite(num) || num <= 0) {
    return ''
  }

  if (typeof options?.toFixed === 'number') {
    return num.toFixed(options.toFixed)
  }

  // Return clean decimal string without scientific notation or unnecessary trailing zeros
  return Number.isInteger(num) ? num.toString() : num.toString()
}

/**
 * Return raw numeric value, sanitized and clamped to >= 0.
 */
export function sanitizeCurrencyNumber(
  val: number | string | null | undefined,
): number {
  if (val === null || val === undefined || val === '') {
    return 0
  }
  const num = typeof val === 'number' ? val : parseCurrency(val)
  return Number.isFinite(num) && num > 0 ? num : 0
}

/**
 * Convert number to Indonesian words (terbilang).
 * E.g. 1000000 -> "Satu Juta Rupiah"
 */
export function terbilangRupiah(
  val: number | string | null | undefined,
): string {
  const num = typeof val === 'number' ? val : parseCurrency(val)
  if (!Number.isFinite(num) || num <= 0) return 'Nol Rupiah'

  const satuan = [
    '',
    'Satu',
    'Dua',
    'Tiga',
    'Empat',
    'Lima',
    'Enam',
    'Tujuh',
    'Delapan',
    'Sembilan',
    'Sepuluh',
    'Sebelas',
  ]

  function pembilang(n: number): string {
    if (n < 12) return satuan[n] ?? ''
    if (n < 20) return `${pembilang(n - 10)} Belas`
    if (n < 100)
      return `${pembilang(Math.floor(n / 10))} Puluh ${pembilang(n % 10)}`.trim()
    if (n < 200) return `Seratus ${pembilang(n - 100)}`.trim()
    if (n < 1000)
      return `${pembilang(Math.floor(n / 100))} Ratus ${pembilang(n % 100)}`.trim()
    if (n < 2000) return `Seribu ${pembilang(n - 1000)}`.trim()
    if (n < 1_000_000)
      return `${pembilang(Math.floor(n / 1_000))} Ribu ${pembilang(n % 1_000)}`.trim()
    if (n < 1_000_000_000)
      return `${pembilang(Math.floor(n / 1_000_000))} Juta ${pembilang(n % 1_000_000)}`.trim()
    if (n < 1_000_000_000_000)
      return `${pembilang(Math.floor(n / 1_000_000_000))} Miliar ${pembilang(n % 1_000_000_000)}`.trim()
    return `${pembilang(Math.floor(n / 1_000_000_000_000))} Triliun ${pembilang(n % 1_000_000_000_000)}`.trim()
  }

  return `${pembilang(Math.floor(num))} Rupiah`.replace(/\s+/g, ' ').trim()
}
