import fs from 'fs'
import { describe, expect, it } from 'vitest'
import { parseMoneyManagerFile } from './money-manager-parser'

describe('actual Money Manager file test', () => {
  it('parses real 2021-10-12_2026-10-31.xls accurately', async () => {
    const filePath = 'public/2021-10-12_2026-10-31.xls'
    if (!fs.existsSync(filePath)) {
      return
    }
    const buf = fs.readFileSync(filePath)
    const file = new File([buf], '2021-10-12_2026-10-31.xls', {
      type: 'application/vnd.ms-excel',
    })

    const result = await parseMoneyManagerFile(file)

    expect(result.summary.validRecordsCount).toBe(5018)
    expect(result.summary.incomeCount).toBe(1383)
    expect(result.summary.expenseCount).toBe(2944)
    expect(result.summary.transferCount).toBe(691)
    expect(result.summary.uniqueAccounts.length).toBe(18)
    expect(result.summary.uniqueAccounts).toContain('Mandiri')
    expect(result.summary.uniqueAccounts).toContain('BCA')
    expect(result.summary.uniqueAccounts).toContain('GoPay')
    expect(result.summary.uniqueAccounts).toContain('Dompet')
    expect(result.summary.uniqueAccounts).toContain('Reksadana SYAILENDRA')

    // Check transfers destination
    const firstTransfer = result.records.find((r) => r.type === 'TRANSFER')
    expect(firstTransfer).toBeDefined()
    expect(firstTransfer?.transferToAccountName).toBeTruthy()
  })
})
