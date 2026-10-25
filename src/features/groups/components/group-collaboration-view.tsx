import {
    ArrowDownRight,
    ArrowUpRight,
    Calendar,
    ChevronLeft,
    ChevronRight,
    CreditCard,
    ReceiptText,
    TrendingDown,
    TrendingUp,
    Users,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useGroupCollaboration } from '../hooks/use-groups'
import type { GroupMemberDto } from '../types/group'
import { formatDate, formatNumber, formatRupiah } from '@/lib/formatters'

interface GroupCollaborationViewProps {
    readonly groupId: string
    readonly members: GroupMemberDto[]
    readonly period: string
    readonly onPeriodChange: (period: string) => void
}

export function GroupCollaborationView({
    groupId,
    members,
    period,
    onPeriodChange,
}: GroupCollaborationViewProps) {
    const { data: collaboration, isLoading } = useGroupCollaboration(
        groupId,
        period,
    )

    const memberMap = new Map(members.map((m) => [m.user_id, m]))

    // Helper for changing months
    function adjustMonth(delta: number) {
        const [yearStr, monthStr] = period.split('-')
        const year = Number.parseInt(yearStr || '2026', 10)
        const month = Number.parseInt(monthStr || '1', 10) - 1
        const d = new Date(Date.UTC(year, month + delta, 1))
        const nextY = d.getUTCFullYear()
        const nextM = String(d.getUTCMonth() + 1).padStart(2, '0')
        onPeriodChange(`${nextY}-${nextM}`)
    }

    // Calculate totals
    const totalIncome = (collaboration?.contributions || []).reduce(
        (acc, c) => acc + (Number.parseFloat(c.income) || 0),
        0,
    )
    const totalExpense = (collaboration?.contributions || []).reduce(
        (acc, c) => acc + (Number.parseFloat(c.expense) || 0),
        0,
    )
    const netFlow = totalIncome - totalExpense

    return (
        <div className="space-y-6">
            {/* Month Navigator Toolbar */}
            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900/60">
                <div className="flex items-center gap-2">
                    <Calendar className="size-5 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        Periode Laporan:
                    </span>
                    <span className="rounded-lg bg-indigo-50 px-3 py-1 font-mono text-sm font-bold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                        {period}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => adjustMonth(-1)}
                        className="h-8 gap-1 text-xs"
                    >
                        <ChevronLeft className="size-4" /> Bulan Lalu
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            const now = new Date()
                            const ym = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`
                            onPeriodChange(ym)
                        }}
                        className="h-8 text-xs"
                    >
                        Bulan Ini
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => adjustMonth(1)}
                        className="h-8 gap-1 text-xs"
                    >
                        Bulan Depan <ChevronRight className="size-4" />
                    </Button>
                </div>
            </div>

            {isLoading ? (
                <Card className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
                    Memuat ringkasan keuangan bersama…
                </Card>
            ) : (
                <>
                    {/* Highlight Stat Cards */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Pooled Cash Balance */}
                        <Card className="relative overflow-hidden p-5">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                    Total Kas Bersama
                                </span>
                                <div className="grid size-8 place-items-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                                    <CreditCard className="size-4" />
                                </div>
                            </div>
                            <div className="mt-3">
                                {collaboration?.balances && collaboration.balances.length > 0 ? (
                                    collaboration.balances.map((b) => (
                                        <p
                                            key={b.currency}
                                            className="text-xl font-extrabold text-slate-900 dark:text-white"
                                        >
                                            {b.currency === 'IDR'
                                                ? formatRupiah(b.balance)
                                                : `${b.currency} ${formatNumber(b.balance)}`}
                                        </p>
                                    ))
                                ) : (
                                    <p className="text-xl font-extrabold text-slate-900 dark:text-white">
                                        Rp 0
                                    </p>
                                )}
                                <span className="mt-1 block text-[11px] text-slate-400">
                                    Saldo rekening gabungan
                                </span>
                            </div>
                        </Card>

                        {/* Total Shared Income */}
                        <Card className="relative overflow-hidden p-5">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                    Pemasukan Gabungan
                                </span>
                                <div className="grid size-8 place-items-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                                    <TrendingUp className="size-4" />
                                </div>
                            </div>
                            <div className="mt-3">
                                <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                                    {formatRupiah(totalIncome)}
                                </p>
                                <span className="mt-1 block text-[11px] text-slate-400">
                                    Bulan {period}
                                </span>
                            </div>
                        </Card>

                        {/* Total Shared Expense */}
                        <Card className="relative overflow-hidden p-5">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                    Pengeluaran Gabungan
                                </span>
                                <div className="grid size-8 place-items-center rounded-lg bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                                    <TrendingDown className="size-4" />
                                </div>
                            </div>
                            <div className="mt-3">
                                <p className="text-xl font-extrabold text-rose-600 dark:text-rose-400">
                                    {formatRupiah(totalExpense)}
                                </p>
                                <span className="mt-1 block text-[11px] text-slate-400">
                                    Bulan {period}
                                </span>
                            </div>
                        </Card>

                        {/* Net Cashflow */}
                        <Card className="relative overflow-hidden p-5">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                    Arus Kas Bersih
                                </span>
                                <div
                                    className={`grid size-8 place-items-center rounded-lg ${netFlow >= 0
                                            ? 'bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                                            : 'bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
                                        }`}
                                >
                                    {netFlow >= 0 ? (
                                        <ArrowUpRight className="size-4" />
                                    ) : (
                                        <ArrowDownRight className="size-4" />
                                    )}
                                </div>
                            </div>
                            <div className="mt-3">
                                <p
                                    className={`text-xl font-extrabold ${netFlow >= 0
                                            ? 'text-blue-600 dark:text-blue-400'
                                            : 'text-amber-600 dark:text-amber-400'
                                        }`}
                                >
                                    {formatRupiah(netFlow)}
                                </p>
                                <span className="mt-1 block text-[11px] text-slate-400">
                                    {netFlow >= 0 ? 'Surplus kas' : 'Defisit kas'}
                                </span>
                            </div>
                        </Card>
                    </div>

                    {/* Member Contributions */}
                    <Card className="p-6">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <Users className="size-5 text-indigo-600 dark:text-indigo-400" />
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                    Kontribusi Tiap Anggota (Bulan Ini)
                                </h3>
                            </div>
                            <span className="text-xs text-slate-400">
                                Pemasukan vs Pengeluaran per Akun Terhubung
                            </span>
                        </div>

                        <div className="mt-4 space-y-4">
                            {(!collaboration?.contributions ||
                                collaboration.contributions.length === 0) && (
                                    <div className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
                                        Belum ada catatan kontribusi pengeluaran atau pemasukan untuk
                                        bulan {period}.
                                    </div>
                                )}

                            {collaboration?.contributions?.map((c) => {
                                const member = memberMap.get(c.user_id)
                                const name = member?.name || `Anggota (${c.user_id.slice(0, 6)})`
                                const inc = Number.parseFloat(c.income) || 0
                                const exp = Number.parseFloat(c.expense) || 0
                                const expensePercentage =
                                    totalExpense > 0 ? Math.round((exp / totalExpense) * 100) : 0

                                return (
                                    <div
                                        key={`${c.user_id}-${c.currency}`}
                                        className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800/80 dark:bg-slate-900/40"
                                    >
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="grid size-8 place-items-center rounded-lg bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                                                    {name.slice(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                                                        {name}
                                                    </p>
                                                    <span className="text-[11px] text-slate-400">
                                                        Porsi Pengeluaran Grup: {expensePercentage}%
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-6">
                                                <div className="text-right">
                                                    <span className="block text-[11px] text-emerald-600 dark:text-emerald-400">
                                                        + {formatRupiah(inc)}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400">
                                                        Pemasukan
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="block text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                                                        - {formatRupiah(exp)}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400">
                                                        Pengeluaran
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-3">
                                            <Progress
                                                value={expensePercentage}
                                                max={100}
                                                className="h-1.5"
                                                indicatorClassName="bg-rose-500"
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </Card>

                    {/* Shared Transaction Activity Feed */}
                    <Card className="p-6">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <ReceiptText className="size-5 text-indigo-600 dark:text-indigo-400" />
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                    Aktivitas Transaksi Rekening Bersama
                                </h3>
                            </div>
                            <Badge variant="outline" className="text-xs">
                                {collaboration?.feed?.length || 0} Transaksi
                            </Badge>
                        </div>

                        <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800/80">
                            {(!collaboration?.feed || collaboration.feed.length === 0) && (
                                <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
                                    Belum ada transaksi di akun bersama pada periode {period}.
                                </div>
                            )}

                            {collaboration?.feed?.map((item) => {
                                const member = memberMap.get(item.user_id)
                                const isExpense = item.type === 'EXPENSE'
                                const memberName =
                                    member?.name || `User (${item.user_id.slice(0, 6)})`

                                return (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between py-3.5 first:pt-1 last:pb-1"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`grid size-9 place-items-center rounded-xl ${isExpense
                                                        ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                                                        : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                                                    }`}
                                            >
                                                {isExpense ? (
                                                    <ArrowDownRight className="size-4" />
                                                ) : (
                                                    <ArrowUpRight className="size-4" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                                        {item.category || (isExpense ? 'Pengeluaran' : 'Pemasukan')}
                                                    </p>
                                                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                                        oleh {memberName}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-slate-400">
                                                    {formatDate(item.transacted_at)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <p
                                                className={`text-sm font-bold ${isExpense
                                                        ? 'text-rose-600 dark:text-rose-400'
                                                        : 'text-emerald-600 dark:text-emerald-400'
                                                    }`}
                                            >
                                                {isExpense ? '-' : '+'} {formatRupiah(item.amount)}
                                            </p>
                                            <span className="text-[10px] text-slate-400">
                                                {item.currency}
                                            </span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </Card>
                </>
            )}
        </div>
    )
}
