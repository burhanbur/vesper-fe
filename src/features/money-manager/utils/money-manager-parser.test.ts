import { describe, expect, it } from 'vitest'
import {
  generateSampleMoneyManagerFile,
  parseMoneyManagerAmount,
  parseMoneyManagerDate,
  parseMoneyManagerFile,
  parseMoneyManagerType,
} from './money-manager-parser'

describe('money-manager-parser', () => {
  describe('parseMoneyManagerDate', () => {
    it('parses JS Date instances', () => {
      const d = new Date('2024-05-10T12:00:00Z')
      const result = parseMoneyManagerDate(d)
      expect(result).not.toBeNull()
      expect(result?.iso).toBe(d.toISOString())
    })

    it('parses Excel serial dates', () => {
      // 45422 is approx May 10, 2024
      const result = parseMoneyManagerDate(45422.5)
      expect(result).not.toBeNull()
      expect(result?.iso).toContain('2024-05-10')
    })

    it('parses Money Manager format with parentheses for day name (e.g. 2024.10.15(Sel) 14:30)', () => {
      const result = parseMoneyManagerDate('2024.10.15(Sel) 14:30')
      expect(result).not.toBeNull()
      expect(result?.iso).toContain('2024-10-15')
    })

    it('parses YYYY/MM/DD and YYYY-MM-DD formats', () => {
      const r1 = parseMoneyManagerDate('2023/12/25 08:00')
      expect(r1).not.toBeNull()
      expect(r1?.iso).toContain('2023-12-25')

      const r2 = parseMoneyManagerDate('2022-07-04')
      expect(r2).not.toBeNull()
      expect(r2?.iso).toContain('2022-07-04')
    })

    it('parses DD/MM/YYYY format', () => {
      const r = parseMoneyManagerDate('25/12/2023 10:15')
      expect(r).not.toBeNull()
      expect(r?.iso).toContain('2023-12-25')
    })

    it('returns null for invalid or empty dates', () => {
      expect(parseMoneyManagerDate('')).toBeNull()
      expect(parseMoneyManagerDate(null)).toBeNull()
      expect(parseMoneyManagerDate('not a date')).toBeNull()
    })
  })

  describe('parseMoneyManagerAmount', () => {
    it('parses numeric values correctly', () => {
      expect(parseMoneyManagerAmount(50000)).toEqual({
        num: 50000,
        formatted: '50000.00',
      })
      expect(parseMoneyManagerAmount(-25000)).toEqual({
        num: 25000,
        formatted: '25000.00',
      })
    })

    it('parses Indonesian currency formatted string with Rp and dots', () => {
      const res = parseMoneyManagerAmount('Rp 1.500.000')
      expect(res).not.toBeNull()
      expect(res?.num).toBe(1500000)
    })

    it('parses standard decimal format with commas and dots', () => {
      const res1 = parseMoneyManagerAmount('10,000.50')
      expect(res1?.num).toBe(10000.5)

      const res2 = parseMoneyManagerAmount('10.000,50')
      expect(res2?.num).toBe(10000.5)
    })

    it('returns null for zero or invalid amounts', () => {
      expect(parseMoneyManagerAmount(0)).toBeNull()
      expect(parseMoneyManagerAmount('0')).toBeNull()
      expect(parseMoneyManagerAmount('abc')).toBeNull()
      expect(parseMoneyManagerAmount(null)).toBeNull()
    })
  })

  describe('parseMoneyManagerType', () => {
    it('detects income keywords', () => {
      expect(parseMoneyManagerType('Income', 'Gaji', 1000)).toBe('INCOME')
      expect(parseMoneyManagerType('Pemasukan', '', 1000)).toBe('INCOME')
    })

    it('detects transfer keywords', () => {
      expect(parseMoneyManagerType('Transfer', 'BCA', 1000)).toBe('TRANSFER')
      expect(parseMoneyManagerType('Transfer-Out', '', 1000)).toBe('TRANSFER')
      expect(parseMoneyManagerType('', 'Transfer Ke GoPay', 1000)).toBe(
        'TRANSFER',
      )
    })

    it('defaults to expense for expense keywords and others', () => {
      expect(parseMoneyManagerType('Expense', 'Makan', 1000)).toBe('EXPENSE')
      expect(parseMoneyManagerType('Pengeluaran', '', 1000)).toBe('EXPENSE')
      expect(parseMoneyManagerType('', '', 1000)).toBe('EXPENSE')
    })
  })

  describe('sample template generation & roundtrip parsing', () => {
    it('generates a valid sample file blob and parses it with all records', async () => {
      const blob = generateSampleMoneyManagerFile()
      expect(blob).toBeInstanceOf(Blob)
      expect(blob.size).toBeGreaterThan(0)

      const file = new File([blob], 'sample_moneymanager.xlsx', {
        type: blob.type,
      })
      const result = await parseMoneyManagerFile(file)

      expect(result.summary.validRecordsCount).toBe(4)
      expect(result.summary.uniqueAccounts).toContain('BCA')
      expect(result.summary.uniqueAccounts).toContain('GoPay')
      expect(result.summary.incomeCount).toBe(1)
      expect(result.summary.expenseCount).toBe(2)
      expect(result.summary.transferCount).toBe(1)
      expect(result.records.length).toBe(4)
    })
  })
})
