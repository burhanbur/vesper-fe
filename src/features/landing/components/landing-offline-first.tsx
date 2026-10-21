import {
    ArrowRight,
    CheckCircle2,
    RefreshCw,
    Server,
    Smartphone,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function LandingOfflineFirst() {
    const steps = [
        {
            step: '01',
            title: 'Tulis Instan ke Database Lokal',
            desc: 'Setiap pencatatan transaksi langsung tersimpan di storage lokal (SQLite/Drift). Tampilan UI langsung terupdate tanpa loading spinner sama sekali.',
            badge: '0ms Latensi',
        },
        {
            step: '02',
            title: 'Outbox Sync Queue Otomatis',
            desc: 'Sistem menyusun antrean operasi (sync_queue) yang aman dan tahan crash jika aplikasi ditutup sewaktu-waktu.',
            badge: 'Durable Outbox',
        },
        {
            step: '03',
            title: 'Sinkronisasi Cerdas ke Cloud',
            desc: 'Saat perangkat mendeteksi koneksi internet kembali, antrean didorong ke Express 5 & PostgreSQL dengan penanganan konflik versi yang presisi.',
            badge: 'Zero Data Loss',
        },
    ]

    return (
        <section
            id="offline"
            className="scroll-mt-24 border-y border-slate-200/70 bg-slate-50/50 py-16 md:py-24 dark:border-white/5 dark:bg-[#0B101C]/50"
        >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl text-center">
                    <span className="rounded-full border border-sky-200/80 bg-sky-50/80 px-3 py-1 text-xs font-semibold tracking-wider text-sky-700 uppercase dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-400">
                        Arsitektur Tanpa Kompromi
                    </span>
                    <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                        100% Offline-First: Catat Kapan Saja, Di Mana Saja
                    </h2>
                    <p className="mt-3 text-base text-slate-600 sm:text-lg dark:text-slate-300">
                        Pernah gagal mencatat struk karena sinyal hilang di basement parkir
                        atau saat dalam penerbangan? Vesper dirancang offline-first dari
                        hari pertama.
                    </p>
                </div>

                {/* 3 Step Interactive Architecture Process */}
                <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
                    {steps.map((item) => (
                        <div
                            key={item.step}
                            className="relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs backdrop-blur-md dark:border-white/10 dark:bg-[#0D121F]"
                        >
                            <div>
                                <div className="flex items-center justify-between">
                                    <span className="font-mono text-2xl font-black text-sky-600 dark:text-sky-400">
                                        {item.step}
                                    </span>
                                    <Badge variant="info" className="text-[10px]">
                                        {item.badge}
                                    </Badge>
                                </div>

                                <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
                                    {item.title}
                                </h3>
                                <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                                    {item.desc}
                                </p>
                            </div>

                            <div className="mt-6 flex items-center gap-2 border-t border-slate-100 pt-4 text-xs font-medium text-sky-600 dark:border-white/5 dark:text-sky-400">
                                <CheckCircle2 className="size-4 shrink-0" />
                                <span>Terverifikasi di Web & Mobile</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Architecture Visual Banner */}
                <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-md dark:border-white/10 dark:bg-[#0D121F]">
                    <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-3">
                        <div className="flex items-center gap-4">
                            <span className="grid size-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                                <Smartphone className="size-6" />
                            </span>
                            <div>
                                <p className="text-xs font-bold text-slate-900 dark:text-white">
                                    Aplikasi Client (Web / Mobile)
                                </p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                    Database SQLite lokal • Optimistic UI
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-3">
                            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 font-mono text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                                <RefreshCw className="size-4 animate-spin text-emerald-500" />
                                <span>sync_queue (Outbox)</span>
                            </div>
                            <ArrowRight className="hidden size-4 text-slate-400 lg:block" />
                        </div>

                        <div className="flex items-center gap-4">
                            <span className="grid size-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
                                <Server className="size-6" />
                            </span>
                            <div>
                                <p className="text-xs font-bold text-slate-900 dark:text-white">
                                    Express 5 & PostgreSQL Cloud
                                </p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                    Idempotent push • Redis token sessions
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
