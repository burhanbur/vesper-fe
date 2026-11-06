import {
    ArrowDownRight,
    ArrowUpRight,
    Calendar,
    ChevronLeft,
    ChevronRight,
    ReceiptText,
    ShieldAlert,
    Users,
    Wallet,
} from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useGroupCollaboration } from '../hooks/use-groups'
import type { GroupMemberDto } from '../types/group'
import { formatDateTime, formatNumber, formatRupiah } from '@/lib/formatters'

interface GroupCollaborationViewProps {
    readonly groupId: string
    readonly members: GroupMemberDto[]
    readonly period: string
    readonly onPeriodChange: (period: string) => void
}

function formatAccountBalance(
    balance: number | string | undefined,
    currency: string,
): string {
    if (balance === undefined || balance === null || balance === '') {
        return '0'
    }
    if (currency === 'IDR') {
        return formatRupiah(balance)
    }
    return `${currency} ${formatNumber(balance)}`
}

export function GroupCollaborationView({
    groupId,
    members,
    period,
    onPeriodChange,
}: GroupCollaborationViewProps) {
    const [page, setPage] = useState(1)

    const { data: collaboration, isLoading } = useGroupCollaboration(
        groupId,
        period,
        page,
    )

    const memberMap = new Map(members.map((m) => [m.user_id, m]))

    // Helper for changing months
    function adjustMonth(delta: number) {
        setPage(1)
        const [yearStr, monthStr] = period.split('-')
        const year = Number.parseInt(yearStr || '2026', 10)
        const month = Number.parseInt(monthStr || '1', 10) - 1
        const d = new Date(Date.UTC(year, month + delta, 1))
        const nextY = d.getUTCFullYear()
        const nextM = String(d.getUTCMonth() + 1).padStart(2, '0')
        onPeriodChange(`${nextY}-${nextM}`)
    }

    const hasBalances = (collaboration?.balances || []).length > 0
    const contributions = collaboration?.contributions || []
    const feed = collaboration?.feed || []

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
                            setPage(1)
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

            {/* Informational banner matching mobile */}
            <div className="flex items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 dark:border-indigo-900/40 dark:bg-indigo-950/20">
                <ShieldAlert className="size-5 shrink-0 text-indigo-600 dark:text-indigo-400" />
                <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    <p className="font-semibold text-slate-900 dark:text-white">
                        Kolaborasi Kas Bersama Online
                    </p>
                    <p className="mt-0.5">
                        Saldo akun CASH yang dibagikan, per mata uang. Kontribusi = pemasukan/pengeluaran
                        berkategori terpetakan pada bulan acuan server terpilih, bukan utang atau setoran anggota.
                        Transfer dan investasi tidak dihitung.
                    </p>
                </div>
            </div>

            {isLoading ? (
                <Card className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
                    Memuat ringkasan keuangan bersama…
                </Card>
            ) : (
                <>
                    {/* Saldo Kas Bersama (Per Currency, No Fake Unified Totals) */}
                    <div>
                        <div className="mb-3 flex items-center gap-2">
                            <Wallet className="size-5 text-indigo-600 dark:text-indigo-400" />
                            <div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                    Saldo Kas Bersama
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Saldo akun kas yang dibagikan oleh anggota grup per mata uang
                                </p>
                            </div>
                        </div>

                        {!hasBalances ? (
                            <Card className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">
                                Tidak ada saldo kas dibagikan.
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {collaboration?.balances.map((b) => (
                                    <Card
                                        key={b.currency}
                                        className="flex items-center justify-between p-5 border border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-white dark:border-slate-800 dark:from-slate-900/50 dark:to-slate-900"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="grid size-10 place-items-center rounded-xl bg-white shadow-xs dark:bg-slate-800 text-indigo-600 dark:text-indigo-400">
                                                <Wallet className="size-5" />
                                            </div>
                                            <div>
                                                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                                    Kas ({b.currency})
                                                </span>
                                                <p className="text-xl font-extrabold text-slate-900 dark:text-white">
                                                    {formatAccountBalance(b.balance, b.currency)}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="text-[10px]">
                                            {b.currency}
                                        </Badge>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Member Contributions (Per Member, Per Currency, No Fake Total Expense/Percentages) */}
                    <Card className="p-6">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <Users className="size-5 text-indigo-600 dark:text-indigo-400" />
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                        Kontribusi Bulanan (Halaman Ini)
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Pemasukan dan pengeluaran berkategori terpetakan per anggota pada periode {period}
                                    </p>
                                </div>
                            </div>
                            <Badge variant="outline" className="text-xs">
                                {contributions.length} Catatan
                            </Badge>
                        </div>

                        <div className="mt-4 space-y-3">
                            {contributions.length === 0 && (
                                <div className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
                                    Belum ada catatan kontribusi pengeluaran atau pemasukan untuk bulan {period}.
                                </div>
                            )}

                            {contributions.map((c) => {
                                const member = memberMap.get(c.user_id)
                                const name = member?.name || `Anggota (${c.user_id.slice(0, 6)})`

                                return (
                                    <div
                                        key={`${c.user_id}-${c.currency}`}
                                        className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800/80 dark:bg-slate-900/40"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="grid size-9 place-items-center rounded-lg bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                                                {name.slice(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">
                                                    {name}
                                                </p>
                                                <span className="text-[11px] text-slate-400">
                                                    ID: {c.user_id.slice(0, 8)}…
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 sm:gap-6">
                                            <Badge variant="secondary" className="text-[10px]">
                                                {c.currency}
                                            </Badge>
                                            <div className="rounded-lg bg-emerald-50 px-3 py-1.5 text-right dark:bg-emerald-950/40">
                                                <span className="block text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                                    + {formatAccountBalance(c.income, c.currency)}
                                                </span>
                                                <span className="text-[10px] text-slate-400">
                                                    Masuk
                                                </span>
                                            </div>
                                            <div className="rounded-lg bg-rose-50 px-3 py-1.5 text-right dark:bg-rose-950/40">
                                                <span className="block text-xs font-bold text-rose-600 dark:text-rose-400">
                                                    - {formatAccountBalance(c.expense, c.currency)}
                                                </span>
                                                <span className="text-[10px] text-slate-400">
                                                    Keluar
                                                </span>
                                            </div>
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
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                        Aktivitas Transaksi Rekening Bersama
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Mutasi akun bersama (tanpa catatan pribadi)
                                    </p>
                                </div>
                            </div>
                            <Badge variant="outline" className="text-xs">
                                {feed.length} Transaksi
                            </Badge>
                        </div>

                        <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800/80">
                            {feed.length === 0 && (
                                <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
                                    Belum ada transaksi di akun bersama pada periode {period}.
                                </div>
                            )}

                            {feed.map((item) => {
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
                                                    {formatDateTime(item.transacted_at)}
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
                                                {isExpense ? '-' : '+'} {formatAccountBalance(item.amount, item.currency)}
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

                    {/* Pagination Toolbar */}
                    <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900/60">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page <= 1}
                            className="gap-1 text-xs"
                        >
                            <ChevronLeft className="size-4" /> Halaman Sebelumnya
                        </Button>
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                            Halaman {page}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => p + 1)}
                            disabled={feed.length < 20 && contributions.length < 20}
                            className="gap-1 text-xs"
                        >
                            Halaman Berikutnya <ChevronRight className="size-4" />
                        </Button>
                    </div>
                </>
            )}
        </div>
    )
}
