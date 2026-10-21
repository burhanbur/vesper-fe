import { Link } from '@tanstack/react-router'
import {
    ArrowRight,
    Layers,
    ShieldCheck,
    Sparkles,
    TrendingUp,
    Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export function LandingHero() {
    return (
        <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24">
            {/* Ambient background glows */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute top-12 left-1/2 -z-10 size-[520px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-indigo-600/15 via-purple-600/10 to-emerald-500/10 blur-3xl dark:from-indigo-600/20 dark:via-purple-600/15 dark:to-emerald-500/15"
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute top-40 right-[-100px] -z-10 size-80 rounded-full bg-emerald-500/10 blur-3xl"
            />

            <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
                {/* Release Pill Badge */}
                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-50/80 px-3.5 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm backdrop-blur-md dark:border-indigo-500/30 dark:bg-indigo-950/40 dark:text-indigo-300">
                    <span className="flex size-2 animate-pulse rounded-full bg-emerald-500" />
                    <span>
                        Vesper 2.0 • Offline-First Personal Finance & Wealth Platform
                    </span>
                    <span className="hidden text-indigo-400 sm:inline">•</span>
                    <span className="hidden text-slate-500 sm:inline dark:text-slate-400">
                        Express 5 + React 19
                    </span>
                </div>

                {/* Main Headline */}
                <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-black tracking-tight text-slate-900 sm:text-5xl md:text-6xl md:leading-[1.15] dark:text-white">
                    Satu Platform untuk{' '}
                    <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-500 bg-clip-text text-transparent dark:from-indigo-400 dark:via-purple-400 dark:to-emerald-400">
                        Finansial Harian
                    </span>{' '}
                    &{' '}
                    <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-300">
                        Kekayaan Nyata
                    </span>
                </h1>

                {/* Subtitle */}
                <p className="mx-auto mt-6 max-w-2xl text-base text-slate-600 sm:text-lg md:text-xl dark:text-slate-300">
                    Bukan sekadar pencatat struk belanja. Vesper menyatukan cashflow
                    harian, nested bank pockets, pencatatan utang-piutang, portofolio
                    multi-aset (saham, crypto, reksadana, emas), hingga kolaborasi grup
                    keluarga — super cepat, 100% offline-ready, dan tanpa iklan.
                </p>

                {/* CTA Buttons */}
                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
                    <Button
                        asChild
                        size="lg"
                        variant="default"
                        className="w-full gap-2 sm:w-auto"
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
                        className="w-full gap-2 sm:w-auto"
                    >
                        <Link to="/login">
                            <Sparkles className="size-4 text-indigo-500" aria-hidden />
                            <span>Coba Demo Instan (1 Klik)</span>
                        </Link>
                    </Button>
                </div>

                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                    Tanpa kartu kredit • Langsung coba dengan akun demo • Data privat
                    milik Anda
                </p>

                {/* Feature Badges Strip */}
                <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                    <div className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white/70 p-3 text-left shadow-xs backdrop-blur-md dark:border-white/10 dark:bg-slate-900/50">
                        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                            <Zap className="size-4" />
                        </span>
                        <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">
                                100% Offline-First
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                Input instan tanpa sinyal
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white/70 p-3 text-left shadow-xs backdrop-blur-md dark:border-white/10 dark:bg-slate-900/50">
                        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
                            <Layers className="size-4" />
                        </span>
                        <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">
                                Nested Pockets
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                Kantong Bank Jago & BCA
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white/70 p-3 text-left shadow-xs backdrop-blur-md dark:border-white/10 dark:bg-slate-900/50">
                        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400">
                            <TrendingUp className="size-4" />
                        </span>
                        <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">
                                Multi-Aset Nyata
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                Saham, crypto, & emas
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white/70 p-3 text-left shadow-xs backdrop-blur-md dark:border-white/10 dark:bg-slate-900/50">
                        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400">
                            <ShieldCheck className="size-4" />
                        </span>
                        <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">
                                Privasi & No-Ads
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                Tanpa pelacak komersial
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
