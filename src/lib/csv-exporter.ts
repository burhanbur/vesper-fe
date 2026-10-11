import type { AccountDto } from '@/features/accounts/types/account'
import type { CategoryDto } from '@/features/categories/types/category'
import type { TransactionDto } from '@/features/transactions/types/transaction'
import { formatDateTime } from './formatters'

function escapeCsvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '""'
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return `"${str}"`
}

export function exportTransactionsToCsv(
  transactions: TransactionDto[],
  accountMap: Map<string, AccountDto>,
  categoryMap: Map<string, CategoryDto>,
): void {
  const headers = [
    'Tanggal Transaksi',
    'Tipe',
    'Rekening',
    'Kategori',
    'Jumlah (IDR)',
    'Keterangan',
    'ID Transaksi',
  ]

  const rows = transactions.map((tx) => {
    const isIncome = tx.type === 'INCOME'
    const isTransfer = tx.type === 'TRANSFER'
    const typeLabel = isIncome
      ? 'Pemasukan'
      : isTransfer
        ? 'Transfer'
        : 'Pengeluaran'

    const account = tx.account_id
      ? accountMap.get(tx.account_id)?.name || tx.account_id
      : '-'
    const category = tx.category_id
      ? categoryMap.get(tx.category_id)?.name || tx.category_id
      : '-'

    return [
      escapeCsvCell(formatDateTime(tx.transacted_at)),
      escapeCsvCell(typeLabel),
      escapeCsvCell(account),
      escapeCsvCell(category),
      escapeCsvCell(tx.amount),
      escapeCsvCell(tx.description || '-'),
      escapeCsvCell(tx.id),
    ].join(',')
  })

  // Prepend UTF-8 BOM so Excel opens with correct encoding
  const csvContent =
    '\uFEFF' + [headers.map(escapeCsvCell).join(','), ...rows].join('\r\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `vesper_transaksi_${timestamp}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
