import { Banknote, PiggyBank, Scale, TrendingUp, Wallet } from 'lucide-react'
import { Card } from '@/components/ui/card'
import type { AccountsOverviewStats } from '../utils/account-grouping'
import { formatRupiah } from '@/lib/formatters'

interface AccountsOverviewCardsProps {
    readonly overview: AccountsOverviewStats
}

export function AccountsOverviewCards({
    overview,
}: AccountsOverviewCardsProps) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* 1. Total Kekayaan Bersih (Net Worth) */}
            <Card className="relative overflow-hidden border-slate-200/80 bg-gradient-to-br from-indigo-50/70 via-white to-white p-4 shadow-sm transition-all hover:border-indigo-300 dark:border-slate-800/80 dark:bg-gradient-to-br dark:from-slate-900/90 dark:via-slate-900/60 dark:to-indigo-950/30 dark:shadow-none dark:hover:border-indigo-500/30">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className="text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                            Total Kekayaan Bersih
                        </p>
                        <h3 className="mt-1.5 font-mono text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl dark:text-white">
                            {formatRupiah(overview.netWorth)}
                        </h3>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Saldo semua akun masuk total
                        </p>
                    </div>
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-600 shadow-sm dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-400">
                        <Wallet className="size-5" />
                    </div>
                </div>
            </Card>

            {/* 2. Dana Likuid (Kas, Bank, E-Wallet) */}
            <Card className="relative overflow-hidden border-slate-200/80 bg-gradient-to-br from-blue-50/70 via-white to-white p-4 shadow-sm transition-all hover:border-blue-300 dark:border-slate-800/80 dark:bg-gradient-to-br dark:from-slate-900/90 dark:via-slate-900/60 dark:to-blue-950/30 dark:shadow-none dark:hover:border-blue-500/30">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className="text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                            Dana Likuid (Kas & Bank)
                        </p>
                        <h3 className="mt-1.5 font-mono text-xl font-extrabold tracking-tight text-blue-900 sm:text-2xl dark:text-blue-100">
                            {formatRupiah(overview.liquidCash)}
                        </h3>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Kas fisik, rekening bank, & e-wallet
                        </p>
                    </div>
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-600 shadow-sm dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400">
                        <Banknote className="size-5" />
                    </div>
                </div>
            </Card>

            {/* 3. Investasi & Portofolio */}
            <Card className="relative overflow-hidden border-slate-200/80 bg-gradient-to-br from-amber-50/70 via-white to-white p-4 shadow-sm transition-all hover:border-amber-300 dark:border-slate-800/80 dark:bg-gradient-to-br dark:from-slate-900/90 dark:via-slate-900/60 dark:to-amber-950/30 dark:shadow-none dark:hover:border-amber-500/30">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className="text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                            Investasi & Portofolio
                        </p>
                        <h3 className="mt-1.5 font-mono text-xl font-extrabold tracking-tight text-amber-900 sm:text-2xl dark:text-amber-100">
                            {formatRupiah(overview.investments)}
                        </h3>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Reksadana, saham, crypto & RDN
                        </p>
                    </div>
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 text-amber-600 shadow-sm dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400">
                        <TrendingUp className="size-5" />
                    </div>
                </div>
            </Card>

            {/* 4. Total Hutang & Kewajiban */}
            <Card className="relative overflow-hidden border-slate-200/80 bg-gradient-to-br from-rose-50/70 via-white to-white p-4 shadow-sm transition-all hover:border-rose-300 dark:border-slate-800/80 dark:bg-gradient-to-br dark:from-slate-900/90 dark:via-slate-900/60 dark:to-rose-950/30 dark:shadow-none dark:hover:border-rose-500/30">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className="text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                            Hutang & Kewajiban
                        </p>
                        <h3 className="mt-1.5 font-mono text-xl font-extrabold tracking-tight text-rose-900 sm:text-2xl dark:text-rose-100">
                            {formatRupiah(overview.liabilities)}
                        </h3>
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                            <PiggyBank className="size-3.5 text-slate-400 dark:text-slate-500" />
                            <span>
                                {overview.totalParentAccounts} Rekening •{' '}
                                {overview.totalPockets} Kantong
                            </span>
                        </div>
                    </div>
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-600 shadow-sm dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400">
                        <Scale className="size-5" />
                    </div>
                </div>
            </Card>
        </div>
    )
}
