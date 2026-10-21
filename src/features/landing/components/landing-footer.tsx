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
                        </div>

                        <p className="max-w-sm text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                            Aplikasi pencatatan keuangan pribadi dan keluarga terpadu.
                            Membantu Anda mengelola pengeluaran harian, kantong tabungan, dan
                            portofolio investasi secara rapi dan aman.
                        </p>

                        <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                            <span className="size-2 animate-pulse rounded-full bg-emerald-500" />
                            <span>Sistem Siap Digunakan</span>
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
                                    href="#multi-asset"
                                    className="transition-colors hover:text-slate-900 dark:hover:text-white"
                                >
                                    Portofolio Investasi
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#kolaborasi"
                                    className="transition-colors hover:text-slate-900 dark:hover:text-white"
                                >
                                    Keuangan Bersama
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#offline"
                                    className="transition-colors hover:text-slate-900 dark:hover:text-white"
                                >
                                    Bisa Tanpa Kuota
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#simulasi"
                                    className="transition-colors hover:text-slate-900 dark:hover:text-white"
                                >
                                    Simulasi Tabungan
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#faq"
                                    className="transition-colors hover:text-slate-900 dark:hover:text-white"
                                >
                                    Tanya Jawab (FAQ)
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Tech & Privacy */}
                    <div>
                        <p className="text-xs font-bold tracking-wider text-slate-900 uppercase dark:text-white">
                            Keamanan & Privasi
                        </p>
                        <ul className="mt-3 space-y-2 text-xs">
                            <li className="flex items-center gap-1.5">
                                <ShieldCheck className="size-3.5 text-emerald-500" />
                                <span>Bebas Iklan Selamanya</span>
                            </li>
                            <li>Privasi Data Terjamin 100%</li>
                            <li>Enkripsi Sandi Terlindungi</li>
                            <li>Bisa Dipakai Tanpa Internet</li>
                            <li>Cadangan Otomatis ke Cloud</li>
                            <li>Tanpa Biaya Berlangganan</li>
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
