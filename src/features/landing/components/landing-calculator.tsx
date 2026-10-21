import { ArrowRight, Calculator, TrendingUp } from 'lucide-react'
import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

function formatRupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value)
}

export function LandingCalculator() {
    const [monthlyIncome, setMonthlyIncome] = useState(20_000_000)
    const [monthlyExpense, setMonthlyExpense] = useState(11_000_000)
    const [annualReturnRate, setAnnualReturnRate] = useState(10) // 10% per year

    // Derived calculations
    const monthlySavings = Math.max(0, monthlyIncome - monthlyExpense)
    const savingsRate =
        monthlyIncome > 0 ? Math.round((monthlySavings / monthlyIncome) * 100) : 0

    // Future Value with compound interest formula for monthly contributions:
    // FV = PMT * (((1 + r/12)^(12*t) - 1) / (r/12))
    function calculateFutureValue(years: number): number {
        const monthlyRate = annualReturnRate / 100 / 12
        const totalMonths = years * 12
        if (monthlyRate === 0) {
            return monthlySavings * totalMonths
        }
        return (
            monthlySavings *
            ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate)
        )
    }

    const fv1Year = calculateFutureValue(1)
    const fv3Years = calculateFutureValue(3)
    const fv5Years = calculateFutureValue(5)
    const fv10Years = calculateFutureValue(10)

    return (
        <section id="simulasi" className="scroll-mt-24 py-16 md:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl text-center">
                    <span className="rounded-full border border-indigo-200/80 bg-indigo-50/80 px-3 py-1 text-xs font-semibold tracking-wider text-indigo-700 uppercase dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-400">
                        Simulasi Interaktif
                    </span>
                    <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                        Hitung Potensi Akumulasi Kekayaan Anda
                    </h2>
                    <p className="mt-3 text-base text-slate-600 sm:text-lg dark:text-slate-300">
                        Lihat bagaimana kedisiplinan pencatatan kas harian dan alokasi
                        investasi yang konsisten di Vesper mampu melipatgandakan net worth
                        Anda.
                    </p>
                </div>

                <div className="mt-12 overflow-hidden rounded-3xl border border-slate-200/90 bg-white/90 p-6 shadow-xl backdrop-blur-xl sm:p-8 lg:p-10 dark:border-white/10 dark:bg-[#0D121F]">
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
                        {/* Input Sliders (7 cols) */}
                        <div className="space-y-6 lg:col-span-7">
                            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-white/5">
                                <Calculator className="size-5 text-indigo-600 dark:text-indigo-400" />
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                    Parameter Finansial Bulanan
                                </h3>
                            </div>

                            {/* Income Slider */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <label
                                        htmlFor="income-range"
                                        className="font-medium text-slate-700 dark:text-slate-300"
                                    >
                                        Pemasukan Bulanan Bersih
                                    </label>
                                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                                        {formatRupiah(monthlyIncome)}
                                    </span>
                                </div>
                                <input
                                    id="income-range"
                                    type="range"
                                    min={5_000_000}
                                    max={80_000_000}
                                    step={1_000_000}
                                    value={monthlyIncome}
                                    onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                                    className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-indigo-600 dark:bg-slate-800"
                                />
                            </div>

                            {/* Expense Slider */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <label
                                        htmlFor="expense-range"
                                        className="font-medium text-slate-700 dark:text-slate-300"
                                    >
                                        Pengeluaran & Belanja Rutin
                                    </label>
                                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                                        {formatRupiah(monthlyExpense)}
                                    </span>
                                </div>
                                <input
                                    id="expense-range"
                                    type="range"
                                    min={3_000_000}
                                    max={60_000_000}
                                    step={500_000}
                                    value={monthlyExpense}
                                    onChange={(e) => setMonthlyExpense(Number(e.target.value))}
                                    className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-purple-600 dark:bg-slate-800"
                                />
                            </div>

                            {/* Return Rate Slider */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <label
                                        htmlFor="return-range"
                                        className="font-medium text-slate-700 dark:text-slate-300"
                                    >
                                        Ekspektasi Return Investasi (per Tahun)
                                    </label>
                                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                        {annualReturnRate}% p.a.
                                    </span>
                                </div>
                                <input
                                    id="return-range"
                                    type="range"
                                    min={4}
                                    max={20}
                                    step={1}
                                    value={annualReturnRate}
                                    onChange={(e) => setAnnualReturnRate(Number(e.target.value))}
                                    className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-emerald-600 dark:bg-slate-800"
                                />
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                    Rata-rata return historis portofolio seimbang saham IDX, emas,
                                    dan obligasi.
                                </p>
                            </div>

                            {/* Monthly Savings Summary Box */}
                            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-indigo-500/20 bg-indigo-50/40 p-4 dark:border-indigo-500/20 dark:bg-indigo-950/20">
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                        Sisa Kas / Dana Terinvestasi per Bulan
                                    </p>
                                    <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                                        {formatRupiah(monthlySavings)}
                                    </p>
                                </div>
                                <Badge variant="default" className="text-xs font-bold">
                                    Saving Rate: {savingsRate}%
                                </Badge>
                            </div>
                        </div>

                        {/* Projection Cards (5 cols) */}
                        <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-slate-50/70 p-6 lg:col-span-5 dark:border-white/5 dark:bg-[#111726]/80">
                            <div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                        Proyeksi Nilai Kekayaan Bersih
                                    </span>
                                    <TrendingUp className="size-4 text-emerald-500" />
                                </div>

                                <div className="mt-6 space-y-4">
                                    <div className="flex items-center justify-between border-b border-slate-200/70 pb-3 dark:border-white/5">
                                        <div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                Dalam 1 Tahun
                                            </p>
                                            <p className="text-base font-bold text-slate-900 dark:text-white">
                                                {formatRupiah(fv1Year)}
                                            </p>
                                        </div>
                                        <span className="text-xs font-semibold text-slate-400">
                                            12 Bulan
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between border-b border-slate-200/70 pb-3 dark:border-white/5">
                                        <div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                Dalam 3 Tahun
                                            </p>
                                            <p className="text-lg font-bold text-slate-900 dark:text-white">
                                                {formatRupiah(fv3Years)}
                                            </p>
                                        </div>
                                        <span className="text-xs font-semibold text-slate-400">
                                            36 Bulan
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between border-b border-slate-200/70 pb-3 dark:border-white/5">
                                        <div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                Dalam 5 Tahun
                                            </p>
                                            <p className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
                                                {formatRupiah(fv5Years)}
                                            </p>
                                        </div>
                                        <span className="text-xs font-semibold text-indigo-500">
                                            60 Bulan
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between rounded-xl bg-emerald-500/10 p-3 dark:bg-emerald-500/15">
                                        <div>
                                            <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                                                Dalam 10 Tahun (Compounding Efek)
                                            </p>
                                            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                                                {formatRupiah(fv10Years)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 border-t border-slate-200/70 pt-4 dark:border-white/5">
                                <Button asChild variant="default" className="w-full gap-2">
                                    <Link to="/login">
                                        <span>Mulai Catat di Vesper Sekarang</span>
                                        <ArrowRight className="size-4" aria-hidden />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
