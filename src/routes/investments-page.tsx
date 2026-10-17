import { useNavigate } from '@tanstack/react-router'
import { DollarSign, Plus, RefreshCw, TrendingUp } from 'lucide-react'
import { useState } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { InvestmentFormDialog } from '@/features/investments/components/investment-form-dialog'
import { PriceUpdateDialog } from '@/features/investments/components/price-update-dialog'
import { useInstruments, usePrices } from '@/features/investments'
import { formatRupiah } from '@/lib/formatters'

export function InvestmentsPage() {
  const navigate = useNavigate()

  const [txModalOpen, setTxModalOpen] = useState(false)
  const [priceModalOpen, setPriceModalOpen] = useState(false)

  const { data: instruments = [], isLoading: instLoading } = useInstruments()
  const { data: prices = [] } = usePrices()

  // Map latest prices
  const priceMap = new Map<string, string>()
  prices.forEach((p) => {
    if (!priceMap.has(p.instrument_id)) {
      priceMap.set(p.instrument_id, p.close_price)
    }
  })

  return (
    <AppShell onLogout={() => void navigate({ to: '/login', replace: true })}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2.5 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
              <TrendingUp className="size-7 text-emerald-600 dark:text-emerald-400" />
              Investasi & Portofolio
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Pantau pergerakan harga saham, reksadana, crypto, emas, serta
              catat transaksi beli, jual, dan dividen.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="emerald"
              onClick={() => setTxModalOpen(true)}
              className="gap-1.5"
            >
              <Plus className="size-4" />
              Catat BUY / SELL
            </Button>
            <Button
              variant="outline"
              onClick={() => setPriceModalOpen(true)}
              className="gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <DollarSign className="size-4 text-emerald-600 dark:text-emerald-400" />
              Update Harga Pasar
            </Button>
          </div>
        </div>

        {/* Portfolio Highlights */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Card className="border-emerald-100 bg-white p-5 dark:border-emerald-500/20 dark:bg-slate-900/80">
            <span className="text-xs font-semibold tracking-wider text-emerald-600 uppercase dark:text-emerald-400">
              Total Instrumen Terdaftar
            </span>
            <p className="mt-1 text-3xl font-black text-slate-900 dark:text-white">
              {instruments.length} Aset
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Saham IHSG, Reksadana, Crypto, Emas.
            </p>
          </Card>

          <Card className="border-indigo-100 bg-white p-5 dark:border-indigo-500/20 dark:bg-slate-900/80">
            <span className="text-xs font-semibold tracking-wider text-indigo-600 uppercase dark:text-indigo-400">
              Metode Pencatatan Harga
            </span>
            <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
              Daily Close Price
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Harga pasar tersinkronisasi multi-pengguna.
            </p>
          </Card>

          <Card className="border-amber-100 bg-white p-5 dark:border-amber-500/20 dark:bg-slate-900/80">
            <span className="text-xs font-semibold tracking-wider text-amber-600 uppercase dark:text-amber-400">
              Floating P/L Real-Time
            </span>
            <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
              Aktif & Terpantau
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Berdasarkan average cost price dan snapshot harian.
            </p>
          </Card>
        </div>

        {/* Instruments Table / Cards */}
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-slate-200/80 p-5 dark:border-slate-800/80">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                  Daftar Instrumen Investasi
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                  Aset yang tersedia untuk dicatat ke dalam akun portofolio
                  Anda.
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPriceModalOpen(true)}
                className="text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
              >
                <RefreshCw className="mr-1.5 size-3.5" /> Update Harga
              </Button>
            </div>
          </CardHeader>

          {instLoading ? (
            <div className="p-12 text-center text-sm text-slate-500 dark:text-slate-400">
              Memuat instrumen investasi…
            </div>
          ) : instruments.length === 0 ? (
            <div className="p-12 text-center">
              <TrendingUp className="mx-auto mb-3 size-12 text-slate-400 dark:text-slate-600" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Belum Ada Instrumen
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Belum ada instrumen saham atau crypto yang terdaftar di
                database.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200/80 overflow-x-auto dark:divide-slate-800/80">
              {instruments.map((inst) => {
                const latestPrice = priceMap.get(inst.id)

                return (
                  <div
                    key={inst.id}
                    className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-slate-50/80 sm:p-5 dark:hover:bg-slate-800/30"
                  >
                    <div className="flex min-w-0 items-center gap-3.5">
                      <span className="grid size-10 place-items-center rounded-xl border border-emerald-200 bg-emerald-50 font-mono text-sm font-bold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
                        {inst.code.slice(0, 3)}
                      </span>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            {inst.code}
                          </h3>
                          <Badge
                            variant={
                              inst.type === 'STOCK'
                                ? 'default'
                                : inst.type === 'CRYPTO'
                                  ? 'warning'
                                  : inst.type === 'GOLD'
                                    ? 'warning'
                                    : 'secondary'
                            }
                            className="text-[10px]"
                          >
                            {inst.type}
                          </Badge>
                        </div>
                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                          {inst.name} ({inst.currency})
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-4 text-right">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Harga Pasar Terakhir
                        </p>
                        <p className="font-mono text-base font-bold text-slate-900 dark:text-white">
                          {latestPrice ? formatRupiah(latestPrice) : 'Rp 0'}
                        </p>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="border-slate-200 text-xs text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        onClick={() => setTxModalOpen(true)}
                      >
                        Catat Transaksi
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>

      <InvestmentFormDialog open={txModalOpen} onOpenChange={setTxModalOpen} />
      <PriceUpdateDialog
        open={priceModalOpen}
        onOpenChange={setPriceModalOpen}
      />
    </AppShell>
  )
}
