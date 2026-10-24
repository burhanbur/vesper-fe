import type { PeriodType } from '../types/budget'

/**
 * Returns the period string required by backend budget progress API for a given period type and date.
 * - MONTHLY: "YYYY-MM" (e.g. "2026-10")
 * - ANNUAL: "YYYY" (e.g. "2026")
 * - WEEKLY: "YYYY-MM-DD" (e.g. "2026-10-23")
 * - DAILY: "YYYY-MM-DD" (e.g. "2026-10-23")
 */
export function getCurrentBudgetPeriod(
  periodType: PeriodType,
  date: Date = new Date(),
): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  switch (periodType) {
    case 'MONTHLY':
      return `${year}-${month}`
    case 'ANNUAL':
      return `${year}`
    case 'WEEKLY':
    case 'DAILY':
      return `${year}-${month}-${day}`
  }
}
