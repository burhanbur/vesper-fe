import { CheckCircle2, Coins, Gem, Layers, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function LandingMultiAsset() {
    const assetPillars = [
        {
            title: 'Saham Indonesia (IDX)',
            desc: 'Mencatat transaksi beli/jual per lot, biaya fee transaksi, harga beli rata-rata (Avg Cost), dan dividen.',
            badge: 'Saham & Ekuitas',
            icon: TrendingUp,
        },
        {
            title: 'Logam Mulia & Emas Fisik',
            desc: 'Pantau gramasi emas Antam/UBS Anda dengan harga beli historis dan estimasi nilai pasar per gram.',
            badge: 'Komoditas',
            icon: Gem,
        },
        {
            title: 'Aset Kripto (Crypto)',
            desc: 'Dukungan pecahan desimal token (BTC, ETH, SOL) dengan konversi mata uang dan tracking portfolio terukur.',
            badge: 'Digital Assets',
            icon: Coins,
        },
        {
            title: 'Reksa Dana & Obligasi',
            desc: 'Hitung Unit Penyertaan (UP) dan Nilai Aktiva Bersih (NAB) untuk reksa dana pasar uang maupun pendapatan tetap.',
            badge: 'Mutual Funds',
            icon: Layers,
        },
    ]

    return (
        <section
            id="multi-asset"
            className="scroll-mt-24 border-y border-slate-200/70 bg-slate-50/50 py-16 md:py-24 dark:border-white/5 dark:bg-[#0B101C]/50"
        >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
                    {/* Left Column: Context & Copy */}
                    <div>
                        <span className="rounded-full border border-emerald-200/80 bg-emerald-50/80 px-3 py-1 text-xs font-semibold tracking-wider text-emerald-700 uppercase dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400">
                            Wealth Management Terpadu
                        </span>
                        <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                            Semua Aset Investasi Anda, Dalam Satu Neraca Kekayaan Nyata
                        </h2>
                        <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-300">
                            Kebanyakan aplikasi keuangan hanya mencatat pengeluaran kopi dan
                            makan siang. Vesper dirancang dari awal untuk menghitung seluruh
                            kekayaan Anda — mulai dari tabungan kas sampai portofolio
                            investasi jangka panjang.
                        </p>

                        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {assetPillars.map((item) => {
                                const Icon = item.icon
                                return (
                                    <div
                                        key={item.title}
                                        className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-white/10 dark:bg-slate-900/70"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="grid size-8 place-items-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
                                                <Icon className="size-4" />
                                            </span>
                                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                                                {item.title}
                                            </span>
                                        </div>
                                        <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                                            {item.desc}
                                        </p>
                                    </div>
                                )
                            })}
                        </div>

                        <div className="mt-6 flex items-center gap-3 text-xs font-medium text-slate-600 dark:text-slate-400">
                            <span className="grid size-5 place-items-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                                <CheckCircle2 className="size-3.5" />
                            </span>
                            <span>
                                Harga pasar instrumen dapat diperbarui mandiri atau otomatis via
                                API.
                            </span>
                        </div>
                    </div>

                    {/* Right Column: Visual Collage with High-Quality Image Asset */}
                    <div className="relative">
                        {/* Background Glow */}
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute -inset-4 -z-10 rounded-3xl bg-emerald-500/10 blur-2xl dark:bg-emerald-500/15"
                        />

                        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xl dark:border-white/10 dark:bg-[#0D121F]">
                            {/* Relevant High-Res Asset from Unsplash */}
                            <div className="relative h-64 w-full overflow-hidden sm:h-72">
                                <img
                                    src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1000&q=80"
                                    alt="Layar grafik pasar saham dan analisis portofolio keuangan modern"
                                    loading="lazy"
                                    className="size-full object-cover transition-transform duration-500 hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />

                                <div className="absolute right-4 bottom-4 left-4 flex items-center justify-between">
                                    <Badge variant="success" className="gap-1.5 shadow-md">
                                        <TrendingUp className="size-3.5" />
                                        Floating Profit Aktif
                                    </Badge>
                                    <span className="rounded-md bg-black/60 px-2 py-1 font-mono text-[11px] text-white backdrop-blur-md">
                                        Snapshot Harian Otomatis
                                    </span>
                                </div>
                            </div>

                            {/* Asset Mini Holding Rows */}
                            <div className="divide-y divide-slate-100 p-4 sm:p-5 dark:divide-white/5">
                                <div className="flex items-center justify-between py-2.5">
                                    <div className="flex items-center gap-3">
                                        <span className="grid size-9 place-items-center rounded-lg bg-indigo-50 text-xs font-bold text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                                            BBCA
                                        </span>
                                        <div>
                                            <p className="text-xs font-bold text-slate-900 dark:text-white">
                                                Bank Central Asia Tbk.
                                            </p>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                                10 Lot • Avg Rp 9.450
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                                            Rp 10.300.000
                                        </p>
                                        <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                            +8.9% (+Rp 850.000)
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between py-2.5">
                                    <div className="flex items-center gap-3">
                                        <span className="grid size-9 place-items-center rounded-lg bg-amber-50 text-xs font-bold text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
                                            LM
                                        </span>
                                        <div>
                                            <p className="text-xs font-bold text-slate-900 dark:text-white">
                                                Emas Antam CertiEye
                                            </p>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                                25.00 Gram Fisik
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                                            Rp 37.000.000
                                        </p>
                                        <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                            +28.7% (+Rp 8.250.000)
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between py-2.5">
                                    <div className="flex items-center gap-3">
                                        <span className="grid size-9 place-items-center rounded-lg bg-purple-50 text-xs font-bold text-purple-600 dark:bg-purple-500/15 dark:text-purple-400">
                                            BTC
                                        </span>
                                        <div>
                                            <p className="text-xs font-bold text-slate-900 dark:text-white">
                                                Bitcoin Cold Storage
                                            </p>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                                0.035 BTC
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                                            Rp 51.520.000
                                        </p>
                                        <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                            +43.4% (+Rp 15.600.000)
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
