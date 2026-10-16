import { ArrowDownRight, ArrowUpRight, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatRupiah } from '@/lib/formatters'

interface CashflowChartProps {
  readonly income: number
  readonly expense: number
}

export function CashflowChart({ income, expense }: CashflowChartProps) {
  const total = income + expense
  const incomePercent = total > 0 ? Math.round((income / total) * 100) : 50
  const expensePercent = total > 0 ? Math.round((expense / total) * 100) : 50
  const netSavings = income - expense
  const savingsRate =
    income > 0 ? Math.max(0, Math.round((netSavings / income) * 100)) : 0

  return (
    <Card className="border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-sm dark:border-slate-800/80 dark:bg-slate-900/60 dark:shadow-none">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-200">
            <BarChart3 className="size-4 text-indigo-600 dark:text-indigo-400" />
            Proporsi Arus Kas (Cash Flow)
          </CardTitle>
          <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300">
            Tingkat Tabungan: {savingsRate}%
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Visual Dual Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
              <ArrowDownRight className="size-3.5" /> Masuk ({incomePercent}%)
            </span>
            <span className="flex items-center gap-1 font-medium text-rose-600 dark:text-rose-400">
              Keluar ({expensePercent}%) <ArrowUpRight className="size-3.5" />
            </span>
          </div>

          <div className="flex h-4 w-full overflow-hidden rounded-full border border-slate-200 bg-slate-100 p-0.5 dark:border-slate-800 dark:bg-slate-950">
            <div
              style={{ width: `${incomePercent}%` }}
              className="h-full rounded-l-full bg-gradient-to-r from-emerald-600 to-teal-400 shadow-sm shadow-emerald-500/20 transition-all duration-500"
            />
            <div
              style={{ width: `${expensePercent}%` }}
              className="h-full rounded-r-full bg-gradient-to-r from-rose-500 to-orange-500 shadow-sm shadow-rose-500/20 transition-all duration-500"
            />
          </div>
        </div>

        {/* SVG Comparative Columns */}
        <div className="pt-2">
          <div className="flex h-28 items-end justify-around gap-6 border-b border-slate-200 px-6 pb-2 dark:border-slate-800/80">
            {/* Income Column */}
            <div className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                {formatRupiah(income)}
              </span>
              <div
                style={{
                  height: `${Math.max(16, (income / Math.max(income, expense, 1)) * 72)}px`,
                }}
                className="w-full max-w-16 rounded-t-xl border-x border-t border-emerald-400/60 bg-gradient-to-t from-emerald-600/30 to-emerald-400/80 shadow-lg shadow-emerald-500/10 transition-all"
              />
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Pemasukan
              </span>
            </div>

            {/* Expense Column */}
            <div className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
              <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400">
                {formatRupiah(expense)}
              </span>
              <div
                style={{
                  height: `${Math.max(16, (expense / Math.max(income, expense, 1)) * 72)}px`,
                }}
                className="w-full max-w-16 rounded-t-xl border-x border-t border-rose-400/60 bg-gradient-to-t from-rose-600/30 to-rose-400/80 shadow-lg shadow-rose-500/10 transition-all"
              />
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Pengeluaran
              </span>
            </div>
          </div>
        </div>

        {/* Summary Footer */}
        <div className="flex items-center justify-between pt-1 text-xs text-slate-500 dark:text-slate-400">
          <span>Surplus Bersih (Net Cash Flow):</span>
          <span
            className={`font-bold ${netSavings >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
              }`}
          >
            {formatRupiah(netSavings)}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
