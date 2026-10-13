/**
 * Indonesian Rupiah formatter
 */
export function formatRupiah(
  amount: number | string | null | undefined,
): string {
  if (amount === null || amount === undefined || amount === '') return 'Rp 0'
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  if (Number.isNaN(num)) return 'Rp 0'

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(num)
}

/**
 * Format decimal numbers (e.g. quantity, stocks, crypto)
 */
export function formatNumber(
  val: number | string | null | undefined,
  decimals = 2,
): string {
  if (val === null || val === undefined || val === '') return '0'
  const num = typeof val === 'string' ? parseFloat(val) : val
  if (Number.isNaN(num)) return '0'

  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(num)
}

/**
 * Format ISO date string to localized Indonesian display
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '-'
  try {
    const d = new Date(dateString)
    if (Number.isNaN(d.getTime())) return dateString
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d)
  } catch {
    return dateString
  }
}

/**
 * Format ISO datetime string to localized Indonesian display with time
 */
export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return '-'
  try {
    const d = new Date(dateString)
    if (Number.isNaN(d.getTime())) return dateString
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d)
  } catch {
    return dateString
  }
}

/**
 * Format percentage
 */
export function formatPercent(val: number | string | null | undefined): string {
  if (val === null || val === undefined || val === '') return '0%'
  const num = typeof val === 'string' ? parseFloat(val) : val
  if (Number.isNaN(num)) return '0%'
  const prefix = num > 0 ? '+' : ''
  return `${prefix}${num.toFixed(2)}%`
}

export {
  formatCurrency,
  formatCompactCurrency,
  parseCurrency,
  sanitizeCurrency,
  sanitizeCurrencyNumber,
  terbilangRupiah,
} from './currency'
