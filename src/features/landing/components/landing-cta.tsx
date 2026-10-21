import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export function LandingCta() {
    return (
        <section className="relative overflow-hidden py-16 md:py-24">
            {/* Ambient Glows */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-1/2 -z-10 size-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-indigo-600/20 via-purple-600/15 to-emerald-500/15 blur-3xl"
            />

            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                <div className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-b from-indigo-50/60 via-white to-slate-50/80 p-8 text-center shadow-xl shadow-indigo-500/5 backdrop-blur-xl sm:p-12 md:p-16 dark:border-white/10 dark:bg-gradient-to-b dark:from-[#0E1528] dark:via-[#0D121F] dark:to-[#090D16] dark:shadow-2xl">
                    {/* Subtle concentric ambient ring on card */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -top-24 left-1/2 size-96 -translate-x-1/2 rounded-full bg-indigo-500/5 blur-2xl dark:bg-indigo-500/10"
                    />

                    <span className="relative inline-flex items-center gap-1.5 rounded-full border border-indigo-200/80 bg-indigo-50/90 px-3.5 py-1 text-xs font-semibold text-indigo-700 shadow-xs dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300">
                        <Sparkles className="size-3.5" />
                        <span>Mulai Langkah Cerdas Finansial Anda</span>
                    </span>

                    <h2 className="relative mx-auto mt-6 max-w-2xl text-3xl font-black tracking-tight text-slate-900 sm:text-4xl md:text-5xl md:leading-[1.15] dark:text-white">
                        Waktunya Memiliki Kendali Penuh Atas{' '}
                        <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent dark:from-indigo-400 dark:via-purple-400 dark:to-emerald-400">
                            Setiap Rupiah Anda
                        </span>
                    </h2>

                    <p className="relative mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-300">
                        Tanpa langganan tersembunyi, tanpa iklan, dan tanpa perlu koneksi
                        internet untuk sekadar mencatat pengeluaran. Coba Vesper hari ini
                        juga.
                    </p>

                    <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
                        <Button
                            asChild
                            size="lg"
                            className="w-full gap-2 bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-700 sm:w-auto dark:bg-indigo-600 dark:text-white dark:hover:bg-indigo-500"
                        >
                            <Link to="/login">
                                <span>Mulai Sekarang — Gratis</span>
                                <ArrowRight className="size-4" aria-hidden />
                            </Link>
                        </Button>

                        <Button
                            asChild
                            size="lg"
                            variant="outline"
                            className="w-full gap-2 border-slate-300/80 bg-white text-slate-800 shadow-xs hover:bg-slate-50 hover:text-slate-900 sm:w-auto dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                            <Link to="/login">
                                <Sparkles className="size-4 text-indigo-500" aria-hidden />
                                <span>Coba Akun Demo Instan</span>
                            </Link>
                        </Button>
                    </div>

                    <div className="relative mt-8 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-600 sm:gap-6 dark:text-slate-400">
                        <span className="flex items-center gap-1.5">
                            <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                            <span>Tanpa Kartu Kredit</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                            <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                            <span>Offline-First Asli</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                            <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                            <span>Impor Money Manager</span>
                        </span>
                    </div>
                </div>
            </div>
        </section>
    )
}
