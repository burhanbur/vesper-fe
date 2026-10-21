import { Layers, ShieldCheck } from 'lucide-react'

export function LandingFooter() {
    return (
        <footer className="border-t border-slate-200/80 bg-white/80 py-12 text-slate-600 transition-colors dark:border-white/10 dark:bg-[#070A12] dark:text-slate-400">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                    {/* Brand Info */}
                    <div className="space-y-4 md:col-span-2">
                        <div className="flex items-center gap-3">
                            <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-500 text-white shadow-md shadow-indigo-600/30">
                                <Layers className="size-4" aria-hidden />
                            </span>
                            <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                                VESPER
                            </span>
                            <span className="rounded-md border border-indigo-500/30 bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                                PRO
                            </span>
                        </div>

                        <p className="max-w-sm text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                            Sistem pencatatan finansial harian dan manajemen kekayaan (wealth
                            management) terintegrasi dengan arsitektur offline-first, nested
                            accounts, dan privasi grup keluarga.
                        </p>

                        <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                            <span className="size-2 animate-pulse rounded-full bg-emerald-500" />
                            <span>Sistem Operasional • API Connected</span>
                        </div>
                    </div>

                    {/* Quick Nav */}
                    <div>
                        <p className="text-xs font-bold tracking-wider text-slate-900 uppercase dark:text-white">
                            Eksplorasi Fitur
                        </p>
                        <ul className="mt-3 space-y-2 text-xs">
                            <li>
                                <a
                                    href="#fitur"
                                    className="transition-colors hover:text-slate-900 dark:hover:text-white"
                                >
                                    Fitur Utama
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#multi-aset"
                                    className="transition-colors hover:text-slate-900 dark:hover:text-white"
                                >
                                    Portofolio Multi-Aset
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#kolaborasi"
                                    className="transition-colors hover:text-slate-900 dark:hover:text-white"
                                >
                                    Grup Pasutri & Keluarga
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#offline"
                                    className="transition-colors hover:text-slate-900 dark:hover:text-white"
                                >
                                    Arsitektur Offline-First
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#simulasi"
                                    className="transition-colors hover:text-slate-900 dark:hover:text-white"
                                >
                                    Kalkulator Net Worth
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#faq"
                                    className="transition-colors hover:text-slate-900 dark:hover:text-white"
                                >
                                    Pertanyaan Umum (FAQ)
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Tech & Privacy */}
                    <div>
                        <p className="text-xs font-bold tracking-wider text-slate-900 uppercase dark:text-white">
                            Arsitektur & Privasi
                        </p>
                        <ul className="mt-3 space-y-2 text-xs">
                            <li className="flex items-center gap-1.5">
                                <ShieldCheck className="size-3.5 text-indigo-500" />
                                <span>Zero-Ads Policy</span>
                            </li>
                            <li>PostgreSQL & Redis Session</li>
                            <li>Express 5 & TypeScript</li>
                            <li>React 19 & TanStack Router</li>
                            <li>SQLite / Drift Local Storage</li>
                            <li>Argon2id Password Security</li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 flex flex-col items-center justify-between border-t border-slate-200/80 pt-6 text-xs text-slate-500 sm:flex-row dark:border-white/10 dark:text-slate-500">
                    <p>
                        © 2026 Vesper Personal Finance Platform. Semua hak cipta dilindungi.
                    </p>
                    <p className="mt-2 font-mono text-[11px] sm:mt-0">
                        Designed for real financial clarity.
                    </p>
                </div>
            </div>
        </footer>
    )
}
