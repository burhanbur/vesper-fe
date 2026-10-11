import { PieChart, ShieldCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { AccountDto } from '@/features/accounts/types/account'
import { formatRupiah } from '@/lib/formatters'

interface AssetAllocationChartProps {
  readonly accounts: AccountDto[]
}

interface AllocationBucket {
  name: string
  color: string
  gradient: string
  amount: number
  percent: number
}

export function AssetAllocationChart({ accounts }: AssetAllocationChartProps) {
  // Aggregate accounts into buckets
  const activeAccounts = accounts.filter(
    (a) => a.is_include_total && !a.deleted_at && !a.parent_account_id,
  )

  const totalBalance = activeAccounts.reduce(
    (sum, a) => sum + Math.max(0, parseFloat(a.balance || '0')),
    0,
  )

  let bankTotal = 0
  let walletTotal = 0
  let investmentTotal = 0
  let cashTotal = 0

  activeAccounts.forEach((acc) => {
    const bal = Math.max(0, parseFloat(acc.balance || '0'))
    const icon = acc.icon?.toLowerCase() || ''
    const name = acc.name.toLowerCase()

    if (
      icon === 'chart' ||
      name.includes('bareksa') ||
      name.includes('stockbit') ||
      name.includes('bibit') ||
      name.includes('saham') ||
      name.includes('reksa')
    ) {
      investmentTotal += bal
    } else if (
      icon === 'wallet' ||
      name.includes('gopay') ||
      name.includes('ovo') ||
      name.includes('dana') ||
      name.includes('shopeepay')
    ) {
      walletTotal += bal
    } else if (
      icon === 'cash' ||
      name.includes('dompet') ||
      name.includes('tunai')
    ) {
      cashTotal += bal
    } else {
      bankTotal += bal
    }
  })

  const buckets: AllocationBucket[] = [
    {
      name: 'Bank & Rekening',
      color: '#6366F1', // indigo
      gradient: 'from-indigo-600 to-indigo-400',
      amount: bankTotal,
      percent:
        totalBalance > 0 ? Math.round((bankTotal / totalBalance) * 100) : 0,
    },
    {
      name: 'Investasi & Portofolio',
      color: '#10B981', // emerald
      gradient: 'from-emerald-600 to-teal-400',
      amount: investmentTotal,
      percent:
        totalBalance > 0
          ? Math.round((investmentTotal / totalBalance) * 100)
          : 0,
    },
    {
      name: 'E-Wallet & Digital',
      color: '#06B6D4', // cyan
      gradient: 'from-cyan-600 to-sky-400',
      amount: walletTotal,
      percent:
        totalBalance > 0 ? Math.round((walletTotal / totalBalance) * 100) : 0,
    },
    {
      name: 'Uang Tunai (Cash)',
      color: '#F59E0B', // amber
      gradient: 'from-amber-600 to-yellow-400',
      amount: cashTotal,
      percent:
        totalBalance > 0 ? Math.round((cashTotal / totalBalance) * 100) : 0,
    },
  ].filter((b) => b.amount > 0 || totalBalance === 0)

  return (
    <Card className="border-slate-800/80 bg-slate-900/60 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-bold text-slate-200">
            <PieChart className="size-4 text-emerald-400" />
            Alokasi & Distribusi Kekayaan
          </CardTitle>
          <span className="flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-400">
            <ShieldCheck className="size-3" /> Terdiversifikasi
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Multi-segment Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex h-4 w-full overflow-hidden rounded-full border border-slate-800 bg-slate-950 p-0.5">
            {buckets.length > 0 ? (
              buckets.map((b) => (
                <div
                  key={b.name}
                  style={{
                    width: `${Math.max(b.percent, b.amount > 0 ? 3 : 0)}%`,
                  }}
                  className={`h-full bg-gradient-to-r ${b.gradient} transition-all duration-500 first:rounded-l-full last:rounded-r-full`}
                  title={`${b.name}: ${b.percent}%`}
                />
              ))
            ) : (
              <div className="h-full w-full rounded-full bg-slate-800" />
            )}
          </div>
        </div>

        {/* Bucket Breakdown List */}
        <div className="grid grid-cols-1 gap-2.5 pt-1 sm:grid-cols-2">
          {buckets.map((b) => (
            <div
              key={b.name}
              className="flex items-center justify-between rounded-xl border border-slate-800/60 bg-slate-950/40 p-2.5"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span
                  style={{ backgroundColor: b.color }}
                  className="size-2.5 shrink-0 rounded-full shadow-sm"
                />
                <span className="truncate text-xs font-medium text-slate-300">
                  {b.name}
                </span>
              </div>
              <div className="shrink-0 text-right">
                <span className="block text-xs font-bold text-white">
                  {formatRupiah(b.amount)}
                </span>
                <span className="text-[10px] text-slate-400">
                  {b.percent}% dari total
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
