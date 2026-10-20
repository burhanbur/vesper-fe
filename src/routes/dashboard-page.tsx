import { useNavigate, useSearch } from '@tanstack/react-router'
import {
  ArrowDownRight,
  ArrowRightLeft,
  ArrowUpRight,
  Landmark,
  Plus,
  ReceiptText,
  Target,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { useState } from 'react'
import {
  includedDashboardAccounts,
  visibleDashboardAccounts,
} from '@/features/dashboard/utils/dashboard-accounts'
import { AppShell } from '@/components/layout/app-shell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useAccounts } from '@/features/accounts'
import { useAuth } from '@/features/auth'
import { useBudgets } from '@/features/budgets'
import {
  AssetAllocationChart,
  CashflowChart,
  DashboardPeriodFilter,
  dashboardPeriodLabel,
  dashboardPeriodRange,
  useDashboardSummary,
} from '@/features/dashboard'
import { useInstruments } from '@/features/investments'
import { TransactionFormDialog } from '@/features/transactions/components/transaction-form-dialog'
import { TransferFormDialog } from '@/features/transactions/components/transfer-form-dialog'
import { useTransactions } from '@/features/transactions'
import { formatDate, formatRupiah } from '@/lib/formatters'

export function DashboardPage() {
  const navigate = useNavigate()
  const search = useSearch({ from: '/dashboard' })
  const range = dashboardPeriodRange(search)
  const summary = useDashboardSummary(search)
  const { user } = useAuth()

  const [txModalOpen, setTxModalOpen] = useState(false)
  const [txModalType, setTxModalType] = useState<'INCOME' | 'EXPENSE'>(
    'EXPENSE',
  )
  const [transferModalOpen, setTransferModalOpen] = useState(false)

  // Data queries
  const { data: accounts = [], isLoading: accountsLoading } = useAccounts()
  const {
    data: transactions = [],
    isLoading: txsLoading,
    isError: txsError,
    refetch: retryTransactions,
  } = useTransactions({
    limit: 7,
    sort: '-transacted_at',
    date_range: range.dateRange,
  })
  const { data: budgets = [] } = useBudgets()
  const { data: instruments = [] } = useInstruments()

  const dashboardAccounts = visibleDashboardAccounts(accounts)
  const includedAccounts = includedDashboardAccounts(accounts)
  const totalNetWorth = includedAccounts.reduce(
    (sum, acc) => sum + Number.parseFloat(acc.balance || '0'),
    0,
  )

  const incomeTotal = Number(summary.data?.income_total ?? 0)
  const expenseTotal = Number(summary.data?.expense_total ?? 0)
  const netCashflow = Number(summary.data?.net_cashflow ?? 0)
  const cashflowStatus = summary.isError
    ? 'Tidak tersedia'
    : summary.isPending
      ? 'Memuat…'
      : undefined

  function openQuickAdd(type: 'INCOME' | 'EXPENSE') {
    setTxModalType(type)
    setTxModalOpen(true)
  }

  return (
    <AppShell onLogout={() => void navigate({ to: '/login', replace: true })}>
      <div className="space-y-8">
        {/* Header Welcome & Quick Stats */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                Selamat datang, {user?.name?.split(' ')[0] ?? 'User'} 👋
              </h1>
            </div>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Berikut adalah ringkasan aset, arus kas, dan grafik portofolio
              Anda.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="emerald"
              size="sm"
              onClick={() => openQuickAdd('INCOME')}
              className="gap-1.5"
            >
              <ArrowDownRight className="size-4" />
              Pemasukan
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => openQuickAdd('EXPENSE')}
              className="gap-1.5"
            >
              <ArrowUpRight className="size-4" />
              Pengeluaran
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTransferModalOpen(true)}
              className="gap-1.5"
            >
              <ArrowRightLeft className="size-4 text-indigo-600 dark:text-indigo-400" />
              Transfer
            </Button>
          </div>
        </div>

        <DashboardPeriodFilter
          search={search}
          onChange={(nextSearch) =>
            void navigate({ to: '/dashboard', search: nextSearch })
          }
        />
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Arus kas: {dashboardPeriodLabel(search)} (WIB). Kekayaan bersih, saldo
          rekening, dan alokasi aset menunjukkan kondisi saat ini, bukan periode
          terpilih.
        </p>
        {summary.isError && (
          <div
            role="alert"
            className="flex items-center gap-3 text-sm text-rose-600 dark:text-rose-400"
          >
            Ringkasan arus kas gagal dimuat.
            <Button
              variant="outline"
              size="sm"
              onClick={() => void summary.refetch()}
            >
              Coba lagi ringkasan
            </Button>
          </div>
        )}
        {summary.isFetching && !summary.isPending && (
          <p
            role="status"
            className="text-sm text-slate-500 dark:text-slate-400"
          >
            Memperbarui arus kas…
          </p>
        )}

        {/* Net Worth & Cashflow Highlight Cards */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {/* Total Net Worth */}
          <Card className="relative overflow-hidden border-indigo-200/80 bg-gradient-to-br from-indigo-50/90 via-white to-indigo-100/40 shadow-sm dark:border-indigo-500/30 dark:bg-gradient-to-br dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-900/90 dark:shadow-indigo-950/30">
            <div className="absolute top-0 right-0 p-5 opacity-5 dark:opacity-10">
              <Landmark className="size-24 text-indigo-600 dark:text-indigo-400" />
            </div>
            <CardHeader className="pb-2">
              <span className="text-xs font-semibold tracking-wider text-indigo-600 uppercase dark:text-indigo-400">
                Total Kekayaan Bersih (Net Worth)
              </span>
              <CardTitle className="pt-1 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                {accountsLoading ? 'Memuat…' : formatRupiah(totalNetWorth)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Terdiri dari {includedAccounts.length} rekening & akun yang
                disertakan dalam total.
              </p>
            </CardContent>
          </Card>

          {/* Total Pemasukan */}
          <Card className="relative overflow-hidden border-emerald-200/80 bg-gradient-to-br from-emerald-50/70 via-white to-white shadow-sm dark:border-emerald-500/20 dark:bg-slate-900/80 dark:bg-none dark:shadow-none">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wider text-emerald-600 uppercase dark:text-emerald-400">
                  Total Pemasukan (Periode Terpilih)
                </span>
                <span className="grid size-7 place-items-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
                  <ArrowDownRight className="size-4" />
                </span>
              </div>
              <CardTitle className="pt-1 text-2xl font-extrabold tracking-tight text-emerald-600 sm:text-3xl dark:text-emerald-400">
                {cashflowStatus ?? formatRupiah(incomeTotal)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Transaksi dana masuk yang berhasil dicatat.
              </p>
            </CardContent>
          </Card>

          {/* Total Pengeluaran */}
          <Card className="relative overflow-hidden border-rose-200/80 bg-gradient-to-br from-rose-50/70 via-white to-white shadow-sm dark:border-rose-500/20 dark:bg-slate-900/80 dark:bg-none dark:shadow-none">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wider text-rose-600 uppercase dark:text-rose-400">
                  Total Pengeluaran (Periode Terpilih)
                </span>
                <span className="grid size-7 place-items-center rounded-lg bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400">
                  <ArrowUpRight className="size-4" />
                </span>
              </div>
              <CardTitle className="pt-1 text-2xl font-extrabold tracking-tight text-rose-600 sm:text-3xl dark:text-rose-400">
                {cashflowStatus ?? formatRupiah(expenseTotal)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Net Savings:</span>
                <span
                  className={`font-semibold ${netCashflow >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                    }`}
                >
                  {cashflowStatus ?? formatRupiah(netCashflow)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Visual Financial Analytics Section */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {cashflowStatus ? (
            <Card>
              <CardContent className="p-8" role="status">
                Arus kas: {cashflowStatus}
              </CardContent>
            </Card>
          ) : (
            <CashflowChart income={incomeTotal} expense={expenseTotal} />
          )}
          <AssetAllocationChart accounts={includedAccounts} />
        </div>

        {/* Account Cards & Wallets Breakdown */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
                <Wallet className="size-5 text-indigo-600 dark:text-indigo-400" />
                Rekening & Dompet Digital
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Saldo pada akun bank dan dompet yang Anda miliki.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void navigate({ to: '/accounts' })}
              className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Lihat Semua ({dashboardAccounts.length}) →
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {dashboardAccounts.slice(0, 4).map((acc) => (
              <Card
                key={acc.id}
                className="cursor-pointer transition-colors hover:border-indigo-500/40"
                onClick={() => void navigate({ to: '/accounts' })}
              >
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-lg">
                      {acc.icon === 'bank'
                        ? '🏦'
                        : acc.icon === 'wallet'
                          ? '💳'
                          : acc.icon === 'cash'
                            ? '💵'
                            : acc.icon === 'chart'
                              ? '📈'
                              : '👛'}
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      {acc.currency}
                    </Badge>
                  </div>
                  <h3 className="mt-2 truncate text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {acc.name}
                  </h3>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                    {formatRupiah(acc.balance)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Two-Column Section: Recent Transactions + Active Budgets */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Recent Transactions Feed (2 cols) */}
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
                  <ReceiptText className="size-5 text-indigo-600 dark:text-indigo-400" />
                  Transaksi Terbaru
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Catatan mutasi dana dan riwayat aktivitas terbaru.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => void navigate({ to: '/transactions' })}
                className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                Semua Transaksi →
              </Button>
            </div>

            <Card className="divide-y divide-slate-200/80 dark:divide-slate-800/80">
              {txsLoading ? (
                <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
                  Memuat daftar transaksi…
                </div>
              ) : txsError ? (
                <div
                  role="alert"
                  className="p-8 text-sm text-rose-600 dark:text-rose-400"
                >
                  Transaksi gagal dimuat.{' '}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void retryTransactions()}
                  >
                    Coba lagi transaksi
                  </Button>
                </div>
              ) : transactions.length === 0 ? (
                <div className="p-10 text-center">
                  <ReceiptText className="mx-auto mb-2 size-10 text-slate-400 dark:text-slate-600" />
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-300">
                    Belum ada transaksi
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Mulai catat transaksi pertama Anda dengan menekan tombol
                    Catat Transaksi.
                  </p>
                  <Button
                    size="sm"
                    className="mt-4"
                    onClick={() => openQuickAdd('EXPENSE')}
                  >
                    <Plus className="mr-1 size-3.5" /> Catat Transaksi
                  </Button>
                </div>
              ) : (
                transactions.slice(0, 7).map((tx) => {
                  const isIncome = tx.type === 'INCOME'
                  const isTransfer = tx.type === 'TRANSFER'
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className={`grid size-9 place-items-center rounded-xl text-sm ${isIncome
                            ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400'
                            : isTransfer
                              ? 'bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400'
                              : 'bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400'
                            }`}
                        >
                          {isIncome ? (
                            <ArrowDownRight className="size-4" />
                          ) : isTransfer ? (
                            <ArrowRightLeft className="size-4" />
                          ) : (
                            <ArrowUpRight className="size-4" />
                          )}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                            {tx.description ||
                              (isIncome
                                ? 'Pemasukan'
                                : isTransfer
                                  ? 'Transfer Antar Akun'
                                  : 'Pengeluaran')}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {formatDate(tx.transacted_at)}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <span
                          className={`font-mono text-sm font-bold tracking-tight ${isIncome
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : isTransfer
                              ? 'text-sky-600 dark:text-sky-400'
                              : 'text-rose-600 dark:text-rose-400'
                            }`}
                        >
                          {isIncome ? '+' : isTransfer ? '' : '-'}
                          {formatRupiah(tx.amount)}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
            </Card>
          </div>

          {/* Active Budgets & Wealth Overview (1 col) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
                  <Target className="size-5 text-indigo-600 dark:text-indigo-400" />
                  Anggaran (Budgets)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Target pengeluaran Anda.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => void navigate({ to: '/budgets' })}
                className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                Kelola →
              </Button>
            </div>

            <Card className="space-y-4 p-4">
              {budgets.length === 0 ? (
                <div className="py-6 text-center">
                  <Target className="mx-auto mb-2 size-8 text-slate-400 dark:text-slate-600" />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Belum ada alokasi anggaran aktif.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 text-xs"
                    onClick={() => void navigate({ to: '/budgets' })}
                  >
                    Buat Anggaran
                  </Button>
                </div>
              ) : (
                budgets.slice(0, 3).map((bg) => (
                  <div key={bg.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {bg.description || bg.period_type}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">
                        {formatRupiah(bg.current_amount)}
                      </span>
                    </div>
                    <Progress value={45} max={100} />
                  </div>
                ))
              )}
            </Card>

            {/* Investment Snapshot Quick Card */}
            <Card className="space-y-3 border-emerald-200 bg-emerald-50/70 p-4 shadow-sm dark:border-emerald-500/20 dark:bg-emerald-950/20 dark:shadow-none">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-emerald-700 uppercase dark:text-emerald-400">
                  <TrendingUp className="size-4" />
                  Investasi Terdaftar
                </span>
                <Badge variant="success" className="text-[10px]">
                  {instruments.length} Instrumen
                </Badge>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Pantau portfolio saham, reksadana, dan emas dengan kalkulasi
                floating profit/loss.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full border-emerald-300 text-xs text-emerald-700 hover:bg-emerald-100/70 dark:border-emerald-500/30 dark:text-emerald-300 dark:hover:bg-emerald-500/10"
                onClick={() => void navigate({ to: '/investments' })}
              >
                Buka Portofolio Investasi →
              </Button>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      <TransactionFormDialog
        open={txModalOpen}
        onOpenChange={setTxModalOpen}
        initialType={txModalType}
      />
      <TransferFormDialog
        open={transferModalOpen}
        onOpenChange={setTransferModalOpen}
      />
    </AppShell>
  )
}
