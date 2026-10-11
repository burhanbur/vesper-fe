import * as XLSX from 'xlsx'
import type {
  MoneyManagerImportSummary,
  MoneyManagerRecord,
  MoneyManagerTxType,
} from '../types/money-manager'

interface ColumnIndexes {
  dateIdx: number
  accountIdx: number
  categoryIdx: number
  subcategoryIdx: number
  noteIdx: number
  amountIdx: number
  typeIdx: number
  descIdx: number
}

function safeString(val: unknown): string {
  if (val === null || val === undefined) return ''
  if (typeof val === 'string') return val
  if (typeof val === 'number' || typeof val === 'boolean') return String(val)
  return ''
}

function normalizeHeader(val: unknown): string {
  return safeString(val)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

function findHeaderRow(
  rows: unknown[][],
): { headerIdx: number; cols: ColumnIndexes } | null {
  for (let r = 0; r < Math.min(rows.length, 15); r++) {
    const row = rows[r]
    if (!Array.isArray(row) || row.length < 3) continue

    const headers = row.map(normalizeHeader)

    // Look for essential columns
    const dateIdx = headers.findIndex((h) =>
      /^(period|date|tanggal|waktu|datetime|time)$/.test(h),
    )
    const accountIdx = headers.findIndex((h) =>
      /^(account|accounts|akun|rekening|wallet|dompet)$/.test(h),
    )
    const categoryIdx = headers.findIndex((h) =>
      /^(category|kategori|maincategory|kategoriutama)$/.test(h),
    )
    const amountIdx = headers.findIndex((h) =>
      /^(amount|jumlah|nominal|idr|usd|total|val)$/.test(h),
    )

    // If at least date and (account or amount or category) are found:
    if (
      dateIdx !== -1 &&
      (amountIdx !== -1 || categoryIdx !== -1 || accountIdx !== -1)
    ) {
      const subcategoryIdx = headers.findIndex((h) =>
        /^(subcategory|subkategori|sub)$/.test(h),
      )
      const noteIdx = headers.findIndex((h) =>
        /^(note|notes|catatan|memo|contents|content)$/.test(h),
      )
      const typeIdx = headers.findIndex((h) =>
        /^(incomeexpense|type|jenis|tipe|transactiontype)$/.test(h),
      )
      const descIdx = headers.findIndex((h) =>
        /^(description|deskripsi|keterangan|detail|details)$/.test(h),
      )

      return {
        headerIdx: r,
        cols: {
          dateIdx,
          accountIdx: accountIdx !== -1 ? accountIdx : 1,
          categoryIdx: categoryIdx !== -1 ? categoryIdx : 2,
          subcategoryIdx,
          noteIdx,
          amountIdx: amountIdx !== -1 ? amountIdx : 5,
          typeIdx,
          descIdx,
        },
      }
    }
  }

  // Fallback default column order for standard Money Manager if headers are completely absent
  return {
    headerIdx: 0,
    cols: {
      dateIdx: 0,
      accountIdx: 1,
      categoryIdx: 2,
      subcategoryIdx: 3,
      noteIdx: 4,
      amountIdx: 5,
      typeIdx: 6,
      descIdx: 7,
    },
  }
}

export function parseMoneyManagerDate(
  rawVal: unknown,
): { iso: string; display: string } | null {
  if (rawVal === null || rawVal === undefined) return null

  // 1. If it's a JS Date
  if (rawVal instanceof Date && !isNaN(rawVal.getTime())) {
    return {
      iso: rawVal.toISOString(),
      display: rawVal.toLocaleDateString('id-ID'),
    }
  }

  // 2. If it's an Excel serial date number
  if (typeof rawVal === 'number' && rawVal > 1000) {
    try {
      const utcDays = Math.floor(rawVal - 25569)
      const fractionalDay = rawVal - Math.floor(rawVal)
      let totalSeconds = Math.floor(86400 * fractionalDay)
      const seconds = totalSeconds % 60
      totalSeconds = Math.floor(totalSeconds / 60)
      const minutes = totalSeconds % 60
      const hours = Math.floor(totalSeconds / 60)
      const d = new Date(
        Date.UTC(1970, 0, 1 + utcDays, hours, minutes, seconds),
      )
      if (!isNaN(d.getTime())) {
        return {
          iso: d.toISOString(),
          display: d.toLocaleDateString('id-ID'),
        }
      }
    } catch {
      // Fall through to string parser
    }
  }

  const str = safeString(rawVal).trim()
  if (!str) return null

  // Strip day names like "2024.10.15(Sel) 14:30" or "(Tue)"
  const cleanedStr = str
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  // Match YYYY.MM.DD or YYYY/MM/DD or YYYY-MM-DD
  const ymdMatch = cleanedStr.match(
    /^(\d{4})[./-](\d{1,2})[./-](\d{1,2})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/,
  )
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1] ?? '2026', 10)
    const month = parseInt(ymdMatch[2] ?? '1', 10) - 1
    const day = parseInt(ymdMatch[3] ?? '1', 10)
    const hour = ymdMatch[4] ? parseInt(ymdMatch[4], 10) : 12
    const min = ymdMatch[5] ? parseInt(ymdMatch[5], 10) : 0
    const sec = ymdMatch[6] ? parseInt(ymdMatch[6], 10) : 0

    const d = new Date(Date.UTC(year, month, day, hour, min, sec))
    if (!isNaN(d.getTime())) {
      return {
        iso: d.toISOString(),
        display: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      }
    }
  }

  // Match DD/MM/YYYY or MM/DD/YYYY
  const dmyMatch = cleanedStr.match(
    /^(\d{1,2})[./-](\d{1,2})[./-](\d{4})(?:\s+(\d{1,2}):(\d{1,2}))?/,
  )
  if (dmyMatch) {
    const partA = parseInt(dmyMatch[1] ?? '1', 10)
    const partB = parseInt(dmyMatch[2] ?? '1', 10)
    const year = parseInt(dmyMatch[3] ?? '2026', 10)
    const hour = dmyMatch[4] ? parseInt(dmyMatch[4], 10) : 12
    const min = dmyMatch[5] ? parseInt(dmyMatch[5], 10) : 0

    // If partA > 12, it must be DD/MM/YYYY
    let day = partA
    let month = partB - 1
    if (partA <= 12 && partB > 12) {
      // MM/DD/YYYY
      month = partA - 1
      day = partB
    }

    const d = new Date(Date.UTC(year, month, day, hour, min, 0))
    if (!isNaN(d.getTime())) {
      return {
        iso: d.toISOString(),
        display: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      }
    }
  }

  // Fallback native Date parse
  const parsed = new Date(cleanedStr)
  if (!isNaN(parsed.getTime())) {
    return {
      iso: parsed.toISOString(),
      display: parsed.toLocaleDateString('id-ID'),
    }
  }

  return null
}

export function parseMoneyManagerAmount(
  rawVal: unknown,
): { num: number; formatted: string } | null {
  if (rawVal === null || rawVal === undefined) return null

  if (typeof rawVal === 'number') {
    const abs = Math.abs(rawVal)
    if (abs <= 0) return null
    return { num: abs, formatted: abs.toFixed(2) }
  }

  const str = safeString(rawVal).trim()
  if (!str) return null

  // Clean currency symbols, spaces, parenthesis, and signs
  let cleaned = str.replace(/[Rp$€£¥\s()\-+]/gi, '')

  // Handle Indonesian thousand separator (10.000,00 vs 10,000.00)
  if (cleaned.includes('.') && cleaned.includes(',')) {
    if (cleaned.indexOf('.') < cleaned.indexOf(',')) {
      // 10.000,50 -> 10000.50
      cleaned = cleaned.replace(/\./g, '').replace(',', '.')
    } else {
      // 10,000.50 -> 10000.50
      cleaned = cleaned.replace(/,/g, '')
    }
  } else if (cleaned.includes(',')) {
    // Check if comma is decimal (2 decimals at end) or thousand
    const commaPos = cleaned.lastIndexOf(',')
    if (
      cleaned.length - commaPos === 3 &&
      !cleaned.slice(0, commaPos).includes(',')
    ) {
      cleaned = cleaned.replace(',', '.')
    } else {
      cleaned = cleaned.replace(/,/g, '')
    }
  } else if (cleaned.includes('.')) {
    // Check if dot is thousand separator like 50.000 (length - dotPos === 4)
    const dotPos = cleaned.lastIndexOf('.')
    if (cleaned.length - dotPos === 4) {
      cleaned = cleaned.replace(/\./g, '')
    }
  }

  const num = parseFloat(cleaned)
  if (isNaN(num) || num <= 0) return null

  const abs = Math.abs(num)
  return {
    num: abs,
    formatted: abs.toFixed(2),
  }
}

export function parseMoneyManagerType(
  rawType: unknown,
  rawCategory: unknown,
  rawAmount: unknown,
): MoneyManagerTxType {
  const typeStr = safeString(rawType).toLowerCase().trim()
  const catStr = safeString(rawCategory).toLowerCase().trim()

  if (
    typeStr.includes('income') ||
    typeStr.includes('pemasukan') ||
    typeStr.includes('masuk')
  ) {
    return 'INCOME'
  }
  if (typeStr.includes('transfer') || typeStr.includes('pindah')) {
    return 'TRANSFER'
  }
  if (
    typeStr.includes('expense') ||
    typeStr.includes('pengeluaran') ||
    typeStr.includes('keluar') ||
    typeStr.includes('belanja')
  ) {
    return 'EXPENSE'
  }

  // Check category for transfer hints
  if (catStr.includes('transfer-out') || catStr.includes('transfer')) {
    return 'TRANSFER'
  }

  // If raw amount is negative string, assume expense
  if (typeof rawAmount === 'number' && rawAmount < 0) {
    return 'EXPENSE'
  }

  return 'EXPENSE'
}

export async function parseMoneyManagerFile(
  file: File,
): Promise<{
  records: MoneyManagerRecord[]
  summary: MoneyManagerImportSummary
}> {
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true })

  if (workbook.SheetNames.length === 0) {
    throw new Error('File tidak memiliki lembar kerja (sheet).')
  }

  // Usually Money Manager exports on the first sheet or sheet named 'Account' or 'Daily'
  const sheetName =
    workbook.SheetNames.find((s) =>
      /account|daily|transaksi|harian/i.test(s),
    ) ||
    workbook.SheetNames[0] ||
    ''

  const worksheet = workbook.Sheets[sheetName]
  if (!worksheet) {
    throw new Error('Lembar kerja tidak ditemukan.')
  }

  // Parse as raw 2D array
  const rawRows: unknown[][] = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: '',
    blankrows: false,
  })

  if (rawRows.length < 2) {
    throw new Error('File tidak memiliki data baris yang cukup untuk diproses.')
  }

  const detection = findHeaderRow(rawRows)
  if (!detection) {
    throw new Error(
      'Format kolom Money Manager tidak dapat dikenali secara otomatis.',
    )
  }

  const { headerIdx, cols } = detection
  const records: MoneyManagerRecord[] = []

  let totalIncome = 0
  let totalExpense = 0
  let incomeCount = 0
  let expenseCount = 0
  let transferCount = 0

  const uniqueAccounts = new Set<string>()
  const categoryMap = new Map<string, 'INCOME' | 'EXPENSE'>()
  let earliestDate: Date | null = null
  let latestDate: Date | null = null

  for (let r = headerIdx + 1; r < rawRows.length; r++) {
    const row = rawRows[r]
    if (!Array.isArray(row) || row.length === 0) continue

    const rawDate = row[cols.dateIdx]
    const rawAccount = row[cols.accountIdx]
    const rawCat = row[cols.categoryIdx]
    const rawSubcat = cols.subcategoryIdx !== -1 ? row[cols.subcategoryIdx] : ''
    const rawNote = cols.noteIdx !== -1 ? row[cols.noteIdx] : ''
    const rawAmount = row[cols.amountIdx]
    const rawType = cols.typeIdx !== -1 ? row[cols.typeIdx] : ''
    const rawDesc = cols.descIdx !== -1 ? row[cols.descIdx] : ''

    const dateParsed = parseMoneyManagerDate(rawDate)
    const amountParsed = parseMoneyManagerAmount(rawAmount)

    // Skip blank or invalid rows
    if (!dateParsed || !amountParsed) continue

    const accountName = safeString(rawAccount).trim() || 'Dompet'
    const categoryName = safeString(rawCat).trim() || 'Lainnya'
    const subcategoryName = safeString(rawSubcat).trim() || null
    const note = safeString(rawNote).trim() || null
    const description = safeString(rawDesc).trim() || null

    const type = parseMoneyManagerType(rawType, rawCat, rawAmount)

    // If transfer, destination account might be stored in category column
    let transferToAccountName: string | null = null
    if (type === 'TRANSFER') {
      transferToAccountName = categoryName !== 'Transfer' ? categoryName : null
    }

    // Build comprehensive description
    const descParts: string[] = []
    if (note) descParts.push(note)
    if (subcategoryName) descParts.push(`[${subcategoryName}]`)
    if (description && description !== note) descParts.push(description)
    const fullDescription =
      descParts.length > 0
        ? descParts.join(' - ')
        : type === 'INCOME'
          ? 'Pemasukan'
          : 'Pengeluaran'

    const dObj = new Date(dateParsed.iso)
    if (!earliestDate || dObj < earliestDate) earliestDate = dObj
    if (!latestDate || dObj > latestDate) latestDate = dObj

    uniqueAccounts.add(accountName)
    if (transferToAccountName) uniqueAccounts.add(transferToAccountName)

    if (type === 'INCOME') {
      incomeCount++
      totalIncome += amountParsed.num
      categoryMap.set(categoryName, 'INCOME')
    } else if (type === 'EXPENSE') {
      expenseCount++
      totalExpense += amountParsed.num
      categoryMap.set(categoryName, 'EXPENSE')
    } else {
      transferCount++
    }

    records.push({
      rowIndex: r + 1,
      dateIso: dateParsed.iso,
      displayDate: dateParsed.display,
      accountName,
      categoryName,
      subcategoryName,
      note,
      description,
      amountNumber: amountParsed.num,
      amountFormatted: amountParsed.formatted,
      type,
      transferToAccountName,
      fullDescription,
    })
  }

  if (records.length === 0) {
    throw new Error(
      'Tidak ditemukan transaksi valid di dalam file. Pastikan file berisi kolom Tanggal, Akun, dan Nominal.',
    )
  }

  const uniqueCategories = Array.from(categoryMap.entries()).map(
    ([name, catType]) => ({
      name,
      type: catType,
    }),
  )

  const summary: MoneyManagerImportSummary = {
    fileName: file.name,
    fileSize: file.size,
    totalRowsParsed: rawRows.length - headerIdx - 1,
    validRecordsCount: records.length,
    incomeCount,
    expenseCount,
    transferCount,
    totalIncomeAmount: totalIncome,
    totalExpenseAmount: totalExpense,
    earliestDate: earliestDate ? earliestDate.toISOString().slice(0, 10) : null,
    latestDate: latestDate ? latestDate.toISOString().slice(0, 10) : null,
    uniqueAccounts: Array.from(uniqueAccounts),
    uniqueCategories,
  }

  return { records, summary }
}

/**
 * Helper to generate a realistic sample Money Manager Excel file for testing
 */
export function generateSampleMoneyManagerFile(): Blob {
  const headers = [
    'Period',
    'Accounts',
    'Category',
    'Subcategory',
    'Note',
    'Amount',
    'Income/Expense',
    'Description',
  ]

  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const formatDate = (d: Date) =>
    `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`

  const d1 = new Date(now.getTime() - 86400000 * 2)
  const d2 = new Date(now.getTime() - 86400000 * 5)
  const d3 = new Date(now.getTime() - 86400000 * 10)
  const d4 = new Date(now.getTime() - 86400000 * 15)

  const rows = [
    headers,
    [
      formatDate(d1),
      'BCA',
      'Makanan',
      'Makan Siang',
      'Nasi Padang',
      '35000',
      'Expense',
      'Resto Sederhana',
    ],
    [
      formatDate(d2),
      'BCA',
      'Gaji',
      'Bulanan',
      'Gaji Pokok',
      '15000000',
      'Income',
      'Transfer Kantor',
    ],
    [
      formatDate(d3),
      'GoPay',
      'Transportasi',
      'Ojek Online',
      'Perjalanan kantor',
      '24000',
      'Expense',
      'GoJek',
    ],
    [
      formatDate(d4),
      'BCA',
      'GoPay',
      '',
      'Top up saldo e-wallet',
      '200000',
      'Transfer-Out',
      'Top Up BCA OneKlik',
    ],
  ]

  const worksheet = XLSX.utils.aoa_to_sheet(rows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Account')

  const arrayBuffer = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array',
  }) as unknown as ArrayBuffer
  return new Blob([arrayBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}
