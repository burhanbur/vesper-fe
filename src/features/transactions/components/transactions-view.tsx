import { useNavigate } from '@tanstack/react-router'
import {
  ArrowDownRight,
  ArrowRightLeft,
  ArrowUpRight,
  Download,
  FolderSync,
  Plus,
  ReceiptText,
  Search,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import type { ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useAccounts } from '@/features/accounts'
import { useCategories } from '@/features/categories'
import { TransactionFormDialog } from '@/features/transactions/components/transaction-form-dialog'
import { TransferFormDialog } from '@/features/transactions/components/transfer-form-dialog'
import {
  useDeleteTransaction,
  useTransactions,
} from '../hooks/use-transactions'
import type { TransactionType } from '@/features/transactions/types/transaction'
import { exportTransactionsToCsv } from '@/lib/csv-exporter'
import { formatDateTime, formatRupiah } from '@/lib/formatters'

export function TransactionsView({
  accountId,
  header,
}: {
  accountId?: string
  header?: ReactNode
}) {
  const navigate = useNavigate()

  const [txModalOpen, setTxModalOpen] = useState(false)
  const [txModalType, setTxModalType] = useState<'INCOME' | 'EXPENSE'>(
    'EXPENSE',
  )
  const [transferModalOpen, setTransferModalOpen] = useState(false)

  // Filters
  const [typeFilter, setTypeFilter] = useState<'ALL' | TransactionType>('ALL')
  const [accountFilter, setAccountFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const { data: accounts = [] } = useAccounts()
  const { data: categories = [] } = useCategories()
  const [page, setPage] = useState(1)
  const {
    data: transactions = [],
    pagination,
    isLoading,
    isError,
    refetch,
  } = useTransactions({
    type: typeFilter === 'ALL' ? undefined : typeFilter,
    account_id: accountId ?? (accountFilter || undefined),
    category_id: categoryFilter || undefined,
    page,
    limit: 50,
  })
  const deleteTx = useDeleteTransaction()

  const accountMap = new Map(accounts.map((a) => [a.id, a]))
  const categoryMap = new Map(categories.map((c) => [c.id, c]))

  // Client-side text search filter
  const filteredTransactions = transactions.filter((tx) => {
    if (!searchQuery) return true
    const desc = (tx.description || '').toLowerCase()
    return desc.includes(searchQuery.toLowerCase())
  })

  async function handleDelete(id: string, version: string) {
    if (window.confirm('Hapus transaksi ini?')) {
      await deleteTx.mutateAsync({ id, version })
    }
  }

  function handleExportCsv() {
    if (filteredTransactions.length === 0) {
      toast.error('Tidak ada transaksi untuk diekspor.')
      return
    }
    exportTransactionsToCsv(filteredTransactions, accountMap, categoryMap)
    toast.success(
      `Berhasil mengekspor ${filteredTransactions.length} transaksi ke CSV!`,
    )
  }

  return (
    <>
      <div className="space-y-6">
        {header}
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2.5 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
              <ReceiptText className="size-7 text-indigo-600 dark:text-indigo-400" />
              {accountId ? 'Transaksi Akun' : 'Riwayat Transaksi & Transfer'}
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {accountId
                ? 'Hanya transaksi milik akun ini (account_id), bukan gabungan akun anak.'
                : 'Semua catatan mutasi keuangan masuk, keluar, dan perpindahan dana.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={() => void navigate({ to: '/import' })}
              className="gap-1.5 border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/20"
            >
              <FolderSync className="size-4 text-indigo-600 dark:text-indigo-400" />
              Impor Money Manager
            </Button>
            <Button
              variant="outline"
              onClick={handleExportCsv}
              disabled={filteredTransactions.length === 0}
              className="gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Download className="size-4 text-emerald-600 dark:text-emerald-400" />
              Ekspor CSV
            </Button>
            <Button
              variant="default"
              onClick={() => {
                setTxModalType('EXPENSE')
                setTxModalOpen(true)
              }}
              className="gap-1.5"
            >
              <Plus className="size-4" />
              Catat Transaksi
            </Button>
            <Button
              variant="outline"
              onClick={() => setTransferModalOpen(true)}
              className="gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <ArrowRightLeft className="size-4 text-indigo-600 dark:text-indigo-400" />
              Transfer Antar Akun
            </Button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <Card className="space-y-3 p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* Type Tabs / Dropdown */}
            <div className="space-y-1">
              <label
                className="text-[11px] font-medium text-slate-600 dark:text-slate-400"
                htmlFor="filter-type"
              >
                Tipe Transaksi
              </label>
              <Select
                id="filter-type"
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value as 'ALL' | TransactionType)
                  setPage(1)
                }}
              >
                <option value="ALL">Semua Tipe</option>
                <option value="EXPENSE">💸 Pengeluaran (Expense)</option>
                <option value="INCOME">💰 Pemasukan (Income)</option>
                <option value="TRANSFER">⇄ Transfer</option>
              </Select>
            </div>

            {/* Account Filter */}
            <div className="space-y-1">
              <label
                className="text-[11px] font-medium text-slate-600 dark:text-slate-400"
                htmlFor="filter-account"
              >
                Akun / Rekening
              </label>
              <Select
                id="filter-account"
                value={accountId ?? accountFilter}
                disabled={Boolean(accountId)}
                onChange={(e) => {
                  setAccountFilter(e.target.value)
                  setPage(1)
                }}
              >
                <option value="">Semua Akun</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </Select>
            </div>

            {/* Category Filter */}
            <div className="space-y-1">
              <label
                className="text-[11px] font-medium text-slate-600 dark:text-slate-400"
                htmlFor="filter-cat"
              >
                Kategori
              </label>
              <Select
                id="filter-cat"
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value)
                  setPage(1)
                }}
              >
                <option value="">Semua Kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({cat.type})
                  </option>
                ))}
              </Select>
            </div>

            {/* Search Description */}
            <div className="space-y-1">
              <label
                className="text-[11px] font-medium text-slate-600 dark:text-slate-400"
                htmlFor="filter-search"
              >
                Cari Catatan (halaman ini)
              </label>
              <div className="relative">
                <Search className="absolute top-3 left-3 size-4 text-slate-400" />
                <Input
                  id="filter-search"
                  placeholder="Cari transaksi…"
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Transactions Table / List */}
        <Card className="overflow-hidden">
          {isError ? (
            <div role="alert" className="p-8 text-center">
              <p className="text-slate-600 dark:text-slate-400">Gagal memuat transaksi.</p>
              <Button onClick={() => void refetch()} className="mt-2">Coba lagi</Button>
            </div>
          ) : isLoading ? (
            <div className="p-12 text-center text-sm text-slate-500 dark:text-slate-400">
              Memuat data transaksi…
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-12 text-center">
              <ReceiptText className="mx-auto mb-3 size-12 text-slate-400 dark:text-slate-600" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Tidak Ada Transaksi
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {transactions.length === 0
                  ? 'Belum ada transaksi untuk akun atau filter ini.'
                  : 'Tidak ada transaksi yang cocok dengan filter yang dipilih.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200/80 overflow-x-auto dark:divide-slate-800/80">
              {filteredTransactions.map((tx) => {
                const isIncome = tx.type === 'INCOME'
                const isTransfer = tx.type === 'TRANSFER'
                const acc = accountMap.get(tx.account_id)
                const cat = tx.category_id
                  ? categoryMap.get(tx.category_id)
                  : null

                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-slate-50/80 sm:p-5 dark:hover:bg-slate-800/30"
                  >
                    <div className="flex min-w-0 items-center gap-3.5">
                      <span
                        className={`grid size-10 shrink-0 place-items-center rounded-xl text-base ${isIncome
                            ? 'border border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-400'
                            : isTransfer
                              ? 'border border-sky-200 bg-sky-50 text-sky-600 dark:border-sky-500/30 dark:bg-sky-500/15 dark:text-sky-400'
                              : 'border border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-400'
                          }`}
                      >
                        {isIncome ? (
                          <ArrowDownRight className="size-5" />
                        ) : isTransfer ? (
                          <ArrowRightLeft className="size-5" />
                        ) : (
                          <ArrowUpRight className="size-5" />
                        )}
                      </span>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-semibold text-slate-900 sm:text-base dark:text-slate-100">
                            {tx.description ||
                              (isIncome
                                ? 'Pemasukan'
                                : isTransfer
                                  ? 'Transfer Dana'
                                  : 'Pengeluaran')}
                          </p>
                          {cat ? (
                            <Badge variant="secondary" className="text-[10px]">
                              {cat.name}
                            </Badge>
                          ) : null}
                          {acc ? (
                            <Badge variant="outline" className="text-[10px]">
                              {acc.name}
                            </Badge>
                          ) : null}
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                          {formatDateTime(tx.transacted_at)}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-4">
                      <span
                        className={`font-mono text-base font-bold tracking-tight sm:text-lg ${isIncome
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : isTransfer
                              ? 'text-sky-600 dark:text-sky-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                      >
                        {isIncome ? '+' : isTransfer ? '' : '-'}
                        {formatRupiah(tx.amount)}
                      </span>

                      <button
                        type="button"
                        onClick={() => void handleDelete(tx.id, tx.version)}
                        className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-rose-400"
                        title="Hapus Transaksi"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
        {pagination && !isError ? (
          <nav
            aria-label="Pagination transaksi"
            className="flex flex-wrap items-center justify-between gap-3"
          >
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Halaman {pagination.current_page} dari {pagination.last_page} ·{' '}
              {pagination.total} transaksi
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={isLoading || page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Sebelumnya
              </Button>
              <Button
                variant="outline"
                disabled={isLoading || page >= pagination.last_page}
                onClick={() => setPage(page + 1)}
              >
                Berikutnya
              </Button>
            </div>
          </nav>
        ) : null}
      </div>

      <TransactionFormDialog
        open={txModalOpen}
        onOpenChange={setTxModalOpen}
        initialType={txModalType}
      />
      <TransferFormDialog
        open={transferModalOpen}
        onOpenChange={setTransferModalOpen}
      />
    </>
  )
}
