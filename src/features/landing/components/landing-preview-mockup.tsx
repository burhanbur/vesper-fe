import {
    ArrowDownLeft,
    ArrowUpRight,
    CheckCircle2,
    Coins,
    FolderTree,
    Lock,
    ShieldCheck,
    TrendingUp,
    Users,
    Wallet,
} from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'

type PreviewTab = 'networth' | 'portfolio' | 'pockets' | 'group'

export function LandingPreviewMockup() {
    const [activeTab, setActiveTab] = useState<PreviewTab>('networth')

    return (
        <div className="relative mx-auto mt-8 max-w-6xl px-4 sm:px-6 lg:px-8">
            {/* Outer Glow */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-8 -top-8 -bottom-8 -z-10 rounded-3xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-emerald-500/10 blur-2xl dark:from-indigo-500/20 dark:via-purple-500/20 dark:to-emerald-500/20"
            />

            {/* Mockup Frame Container */}
            <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 shadow-2xl backdrop-blur-xl transition-all duration-300 dark:border-white/10 dark:bg-[#0D121F]/95">
                {/* Window Chrome / Title Bar */}
                <div className="flex flex-wrap items-center justify-between border-b border-slate-200/80 bg-slate-50/90 px-4 py-3 dark:border-white/10 dark:bg-[#0A0E18]">
                    <div className="flex items-center gap-2">
                        <span className="size-3 rounded-full bg-rose-500/80" />
                        <span className="size-3 rounded-full bg-amber-500/80" />
                        <span className="size-3 rounded-full bg-emerald-500/80" />
                        <span className="ml-2 hidden font-mono text-xs text-slate-400 sm:inline">
                            vesper.app/dashboard
                        </span>
                    </div>

                    {/* Tab Switcher */}
                    <div className="flex flex-wrap items-center gap-1 rounded-xl bg-slate-200/60 p-1 dark:bg-slate-900/80">
                        <button
                            type="button"
                            onClick={() => setActiveTab('networth')}
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${activeTab === 'networth'
                                    ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-indigo-300'
                                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                                }`}
                        >
                            Net Worth
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('portfolio')}
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${activeTab === 'portfolio'
                                    ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-indigo-300'
                                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                                }`}
                        >
                            Portofolio Aset
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('pockets')}
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${activeTab === 'pockets'
                                    ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-indigo-300'
                                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                                }`}
                        >
                            Nested Pockets
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('group')}
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${activeTab === 'group'
                                    ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-indigo-300'
                                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                                }`}
                        >
                            Grup Pasutri
                        </button>
                    </div>

                    <div className="hidden items-center gap-2 text-xs font-medium text-emerald-600 md:flex dark:text-emerald-400">
                        <span className="size-2 animate-pulse rounded-full bg-emerald-500" />
                        <span>SQLite Synced (0ms latency)</span>
                    </div>
                </div>

                {/* Mockup Body Content */}
                <div className="p-5 sm:p-6 md:p-8">
                    {/* TAB 1: NET WORTH */}
                    {activeTab === 'networth' && (
                        <div className="space-y-6">
                            {/* Top Banner */}
                            <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 sm:flex-row sm:items-center dark:border-white/5 dark:bg-[#111726]/80">
                                <div>
                                    <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                        Total Kekayaan Bersih (Net Worth)
                                    </p>
                                    <div className="mt-1 flex items-baseline gap-3">
                                        <span className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                                            Rp 248.520.000
                                        </span>
                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                                            <ArrowUpRight className="size-3.5" />
                                            +14.2% (Rp 30.8jt)
                                        </span>
                                    </div>
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                        Otomatis dihitung dari saldo kas, nested accounts, dan
                                        market value investasi.
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="rounded-xl border border-indigo-500/20 bg-indigo-50/80 px-3 py-2 text-center dark:bg-indigo-950/30">
                                        <span className="block text-[10px] text-slate-500 dark:text-slate-400">
                                            Savings Rate
                                        </span>
                                        <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                                            42.5%
                                        </span>
                                    </span>
                                    <span className="rounded-xl border border-emerald-500/20 bg-emerald-50/80 px-3 py-2 text-center dark:bg-emerald-950/30">
                                        <span className="block text-[10px] text-slate-500 dark:text-slate-400">
                                            Rasio Utang
                                        </span>
                                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                            0.0% (Bersih)
                                        </span>
                                    </span>
                                </div>
                            </div>

                            {/* 3 Pillar Cards */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-white/5 dark:bg-[#121829]">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                            Kas & Bank Likuid
                                        </span>
                                        <Wallet className="size-4 text-indigo-500" />
                                    </div>
                                    <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
                                        Rp 42.150.000
                                    </p>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                        Bank Jago (5 Kantong), BCA, Cash
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-white/5 dark:bg-[#121829]">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                            Saham & Reksadana
                                        </span>
                                        <TrendingUp className="size-4 text-emerald-500" />
                                    </div>
                                    <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
                                        Rp 134.870.000
                                    </p>
                                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
                                        +Rp 14.200.000 Floating Profit
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-white/5 dark:bg-[#121829]">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                            Crypto & Logam Mulia
                                        </span>
                                        <Coins className="size-4 text-amber-500" />
                                    </div>
                                    <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
                                        Rp 71.500.000
                                    </p>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                        Emas Antam 25g, Bitcoin (BTC)
                                    </p>
                                </div>
                            </div>

                            {/* Recent Activities Feed Mock */}
                            <div className="rounded-xl border border-slate-200/80 bg-white p-4 dark:border-white/5 dark:bg-[#121829]">
                                <p className="text-xs font-bold text-slate-900 dark:text-white">
                                    Transaksi Terakhir (Otomatis Sync)
                                </p>
                                <div className="mt-3 divide-y divide-slate-100 dark:divide-white/5">
                                    <div className="flex items-center justify-between py-2 text-xs">
                                        <div className="flex items-center gap-2.5">
                                            <span className="grid size-7 place-items-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                                                <ArrowDownLeft className="size-4" />
                                            </span>
                                            <div>
                                                <p className="font-semibold text-slate-800 dark:text-slate-200">
                                                    Gaji Bulanan & Bonus
                                                </p>
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                                    Masuk ke BCA Tahapan • Hari ini
                                                </p>
                                            </div>
                                        </div>
                                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                            +Rp 25.000.000
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between py-2 text-xs">
                                        <div className="flex items-center gap-2.5">
                                            <span className="grid size-7 place-items-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                                                <ArrowUpRight className="size-4" />
                                            </span>
                                            <div>
                                                <p className="font-semibold text-slate-800 dark:text-slate-200">
                                                    Beli Saham BBRI (5 Lot)
                                                </p>
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                                    Transfer dari Bank Jago ke RDN
                                                </p>
                                            </div>
                                        </div>
                                        <span className="font-bold text-slate-900 dark:text-slate-100">
                                            Rp 2.450.000
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between py-2 text-xs">
                                        <div className="flex items-center gap-2.5">
                                            <span className="grid size-7 place-items-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
                                                <Users className="size-4" />
                                            </span>
                                            <div>
                                                <p className="font-semibold text-slate-800 dark:text-slate-200">
                                                    Belanja Supermarket Keluarga
                                                </p>
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                                    Kantong Jago Bersama • Dicatat oleh Alya
                                                </p>
                                            </div>
                                        </div>
                                        <span className="font-bold text-rose-500">-Rp 680.000</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: PORTFOLIO */}
                    {activeTab === 'portfolio' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                        Portofolio Investasi Multi-Aset Terpadu
                                    </h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Mencatat harga beli rata-rata (Avg Cost), harga pasar
                                        terkini, dan floating P/L.
                                    </p>
                                </div>
                                <Badge variant="success" className="gap-1">
                                    <CheckCircle2 className="size-3" />
                                    Floating Profit +Rp 26.325.000
                                </Badge>
                            </div>

                            <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-white/10">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-100/70 text-slate-600 dark:bg-[#121829] dark:text-slate-400">
                                        <tr>
                                            <th className="p-3">Instrumen</th>
                                            <th className="p-3">Kategori</th>
                                            <th className="p-3 text-right">Holdings</th>
                                            <th className="p-3 text-right">Harga Rata-Rata</th>
                                            <th className="p-3 text-right">Harga Sekarang</th>
                                            <th className="p-3 text-right">Floating P/L</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                        <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                            <td className="p-3 font-semibold text-slate-900 dark:text-white">
                                                BBCA (Bank Central Asia)
                                            </td>
                                            <td className="p-3">
                                                <span className="rounded bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                                                    Saham IDX
                                                </span>
                                            </td>
                                            <td className="p-3 text-right font-medium">
                                                10 Lot (1.000 lbr)
                                            </td>
                                            <td className="p-3 text-right text-slate-500">
                                                Rp 9.450
                                            </td>
                                            <td className="p-3 text-right font-semibold">
                                                Rp 10.300
                                            </td>
                                            <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                                                +Rp 850.000 (+8.9%)
                                            </td>
                                        </tr>
                                        <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                            <td className="p-3 font-semibold text-slate-900 dark:text-white">
                                                BBRI (Bank Rakyat Indonesia)
                                            </td>
                                            <td className="p-3">
                                                <span className="rounded bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                                                    Saham IDX
                                                </span>
                                            </td>
                                            <td className="p-3 text-right font-medium">
                                                25 Lot (2.500 lbr)
                                            </td>
                                            <td className="p-3 text-right text-slate-500">
                                                Rp 4.600
                                            </td>
                                            <td className="p-3 text-right font-semibold">Rp 5.250</td>
                                            <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                                                +Rp 1.625.000 (+14.1%)
                                            </td>
                                        </tr>
                                        <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                            <td className="p-3 font-semibold text-slate-900 dark:text-white">
                                                Logam Mulia Emas Antam
                                            </td>
                                            <td className="p-3">
                                                <span className="rounded bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                                                    Komoditas / Emas
                                                </span>
                                            </td>
                                            <td className="p-3 text-right font-medium">25.00 Gram</td>
                                            <td className="p-3 text-right text-slate-500">
                                                Rp 1.150.000/g
                                            </td>
                                            <td className="p-3 text-right font-semibold">
                                                Rp 1.480.000/g
                                            </td>
                                            <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                                                +Rp 8.250.000 (+28.7%)
                                            </td>
                                        </tr>
                                        <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                            <td className="p-3 font-semibold text-slate-900 dark:text-white">
                                                Bitcoin (BTC)
                                            </td>
                                            <td className="p-3">
                                                <span className="rounded bg-purple-50 px-2 py-0.5 text-[10px] font-semibold text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
                                                    Crypto Asset
                                                </span>
                                            </td>
                                            <td className="p-3 text-right font-medium">0.035 BTC</td>
                                            <td className="p-3 text-right text-slate-500">$64.200</td>
                                            <td className="p-3 text-right font-semibold">$92.100</td>
                                            <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                                                +Rp 15.600.000 (+43.4%)
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* TAB 3: NESTED POCKETS */}
                    {activeTab === 'pockets' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                        Struktur Akun Bertingkat (Nested Pockets)
                                    </h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Mengelompokkan kantong tabungan di bawah bank induk tanpa
                                        risiko double-counting di saldo total.
                                    </p>
                                </div>
                                <Badge variant="secondary" className="gap-1">
                                    <FolderTree className="size-3" />
                                    Hierarki Otomatis
                                </Badge>
                            </div>

                            <div className="space-y-3">
                                {/* Bank Jago Group */}
                                <div className="rounded-xl border border-indigo-500/20 bg-indigo-50/20 p-4 dark:border-indigo-500/20 dark:bg-indigo-950/20">
                                    <div className="flex items-center justify-between border-b border-indigo-100 pb-2 dark:border-indigo-900/40">
                                        <div className="flex items-center gap-2">
                                            <span className="grid size-7 place-items-center rounded-lg bg-indigo-600 text-xs font-bold text-white">
                                                J
                                            </span>
                                            <div>
                                                <span className="text-xs font-bold text-slate-900 dark:text-white">
                                                    Bank Jago (Induk)
                                                </span>
                                                <span className="ml-2 text-[11px] text-slate-500 dark:text-slate-400">
                                                    (Total 4 Kantong)
                                                </span>
                                            </div>
                                        </div>
                                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                                            Rp 28.500.000
                                        </span>
                                    </div>

                                    <div className="mt-3 grid grid-cols-1 gap-2 pl-3 sm:grid-cols-2">
                                        <div className="flex items-center justify-between rounded-lg border border-slate-200/60 bg-white p-2.5 text-xs dark:border-white/5 dark:bg-slate-900/60">
                                            <div className="flex items-center gap-2">
                                                <span className="size-2 rounded-full bg-indigo-500" />
                                                <span className="font-medium text-slate-800 dark:text-slate-200">
                                                    Kantong Utama (Harian)
                                                </span>
                                            </div>
                                            <span className="font-semibold text-slate-900 dark:text-white">
                                                Rp 8.200.000
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between rounded-lg border border-slate-200/60 bg-white p-2.5 text-xs dark:border-white/5 dark:bg-slate-900/60">
                                            <div className="flex items-center gap-2">
                                                <span className="size-2 rounded-full bg-emerald-500" />
                                                <span className="font-medium text-slate-800 dark:text-slate-200">
                                                    Belanja Rumah (Grup)
                                                </span>
                                            </div>
                                            <span className="font-semibold text-slate-900 dark:text-white">
                                                Rp 5.300.000
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between rounded-lg border border-slate-200/60 bg-white p-2.5 text-xs dark:border-white/5 dark:bg-slate-900/60">
                                            <div className="flex items-center gap-2">
                                                <span className="size-2 rounded-full bg-purple-500" />
                                                <span className="font-medium text-slate-800 dark:text-slate-200">
                                                    Tabungan Liburan
                                                </span>
                                            </div>
                                            <span className="font-semibold text-slate-900 dark:text-white">
                                                Rp 10.000.000
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between rounded-lg border border-slate-200/60 bg-white p-2.5 text-xs dark:border-white/5 dark:bg-slate-900/60">
                                            <div className="flex items-center gap-2">
                                                <Lock className="size-3 text-amber-500" />
                                                <span className="font-medium text-slate-800 dark:text-slate-200">
                                                    Kantong Terkunci (Darurat)
                                                </span>
                                            </div>
                                            <span className="font-semibold text-slate-900 dark:text-white">
                                                Rp 5.000.000
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Bank BCA */}
                                <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-white/5 dark:bg-[#121829]">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="grid size-7 place-items-center rounded-lg bg-blue-600 text-xs font-bold text-white">
                                                B
                                            </span>
                                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                                                BCA Tahapan (Payroll & Bisnis)
                                            </span>
                                        </div>
                                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                                            Rp 13.650.000
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 4: GROUP */}
                    {activeTab === 'group' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                        Grup Keuangan Pasutri & Smart Privacy Masking
                                    </h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Transparansi penuh pengeluaran bersama tanpa mengorbankan
                                        privasi rekening personal Anda.
                                    </p>
                                </div>
                                <Badge variant="info" className="gap-1">
                                    <ShieldCheck className="size-3" />
                                    Privasi Rekening Terjaga
                                </Badge>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                {/* Side A: Inisiator */}
                                <div className="rounded-xl border border-indigo-500/20 bg-indigo-50/20 p-4 dark:bg-indigo-950/20">
                                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                                        <span className="size-2 rounded-full bg-indigo-500" />
                                        <span>Tampilan Sisi Burhan (Pemilik Rekening Asal)</span>
                                    </div>
                                    <div className="mt-3 space-y-2 text-xs">
                                        <div className="rounded-lg bg-white p-3 shadow-xs dark:bg-slate-900">
                                            <p className="font-medium text-slate-800 dark:text-slate-200">
                                                Transfer ke Kas Belanja Bersama
                                            </p>
                                            <p className="mt-0.5 text-[11px] text-slate-500">
                                                Dari:{' '}
                                                <strong>BCA Payroll Pribadi (No. 8271xxxx)</strong>
                                            </p>
                                            <p className="mt-1 font-bold text-indigo-600 dark:text-indigo-400">
                                                Rp 5.000.000
                                            </p>
                                        </div>
                                        <p className="text-[11px] text-slate-500 italic">
                                            *Burhan dapat melihat nama asli rekening pribadinya secara
                                            normal.
                                        </p>
                                    </div>
                                </div>

                                {/* Side B: Pasangan / Anggota Lain */}
                                <div className="rounded-xl border border-emerald-500/20 bg-emerald-50/20 p-4 dark:bg-emerald-950/20">
                                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                                        <span className="size-2 rounded-full bg-emerald-500" />
                                        <span>Tampilan Sisi Alya (Anggota Grup / Pasangan)</span>
                                    </div>
                                    <div className="mt-3 space-y-2 text-xs">
                                        <div className="rounded-lg bg-white p-3 shadow-xs dark:bg-slate-900">
                                            <p className="font-medium text-slate-800 dark:text-slate-200">
                                                Transfer Masuk ke Kas Belanja Bersama
                                            </p>
                                            <p className="mt-0.5 text-[11px] text-emerald-700 dark:text-emerald-400">
                                                Dari:{' '}
                                                <strong className="underline decoration-emerald-500">
                                                    Rekening Pribadi milik Burhan
                                                </strong>
                                            </p>
                                            <p className="mt-1 font-bold text-emerald-600 dark:text-emerald-400">
                                                +Rp 5.000.000
                                            </p>
                                        </div>
                                        <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                                            ✓ Saldo & nomor rekening BCA pribadi Burhan 100% aman
                                            disamarkan oleh server.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
