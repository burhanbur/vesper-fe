import { EyeOff, Heart, Lock, UserCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function LandingGroupCollaboration() {
    const benefits = [
        {
            title: 'Transparansi Tanpa Mengorbankan Privasi',
            desc: 'Jika Anda mentransfer dana dari tabungan pribadi ke kas bersama, sistem otomatis menyamarkan nama dan saldo rekening pribadi Anda di mata anggota lain.',
            icon: EyeOff,
        },
        {
            title: 'Pemisahan Rekening Rumah Tangga & Personal',
            desc: 'Hanya rekening yang Anda pilih yang dimasukkan ke dalam grup. Rekening investasi dan tabungan pribadi Anda tetap 100% rahasia.',
            icon: Lock,
        },
        {
            title: 'Jelas Siapa Mencatat Apa',
            desc: 'Setiap pengeluaran kas grup mencatat nama anggota pembuatnya. Tidak ada lagi kebingungan siapa yang baru saja membayar listrik atau belanja sayur.',
            icon: UserCheck,
        },
    ]

    return (
        <section id="kolaborasi" className="scroll-mt-24 py-16 md:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
                    {/* Left Column: Visual Asset & Interactive Masking Card */}
                    <div className="relative order-2 lg:order-1">
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute -inset-4 -z-10 rounded-3xl bg-purple-500/10 blur-2xl dark:bg-purple-500/15"
                        />

                        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xl dark:border-white/10 dark:bg-[#0D121F]">
                            <div className="relative h-64 w-full overflow-hidden sm:h-72">
                                <img
                                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80"
                                    alt="Pasangan muda mendiskusikan rencana keuangan keluarga secara nyaman di laptop"
                                    loading="lazy"
                                    className="size-full object-cover transition-transform duration-500 hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />

                                <div className="absolute right-4 bottom-4 left-4 flex items-center justify-between">
                                    <Badge variant="default" className="gap-1.5 shadow-md">
                                        <Heart className="size-3.5 fill-current text-rose-400" />
                                        Grup Finansial Pasutri
                                    </Badge>
                                    <span className="rounded-md bg-black/60 px-2 py-1 font-mono text-[11px] text-white backdrop-blur-md">
                                        Sensor Privasi Aktif
                                    </span>
                                </div>
                            </div>

                            {/* Data Masking Demonstration Box */}
                            <div className="space-y-3 p-5">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-white/5">
                                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                                        Tampilan di Ponsel Pasangan:
                                    </span>
                                    <Badge variant="success" className="text-[10px]">
                                        Privasi Aman
                                    </Badge>
                                </div>

                                <div className="rounded-xl border border-emerald-500/30 bg-emerald-50/30 p-3.5 dark:bg-emerald-950/20">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-xs font-bold text-slate-900 dark:text-white">
                                                Isi Saldo Kas Bersama
                                            </p>
                                            <p className="mt-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                                                Sumber: &quot;Rekening Pribadi milik Burhan&quot;
                                            </p>
                                        </div>
                                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                            +Rp 3.500.000
                                        </span>
                                    </div>
                                    <p className="mt-2 text-[10px] text-slate-500 dark:text-slate-400">
                                        Saldo tabungan dan nomor rekening pribadi Burhan tetap
                                        rahasia, tidak bisa dilihat oleh pasangan.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Context & Benefits */}
                    <div className="order-1 lg:order-2">
                        <span className="rounded-full border border-purple-200/80 bg-purple-50/80 px-3 py-1 text-xs font-semibold tracking-wider text-purple-700 uppercase dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-400">
                            Harmonis & Terbuka
                        </span>
                        <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                            Kelola Pengeluaran Bersama Pasangan Tanpa Drama Privasi
                        </h2>
                        <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-300">
                            Keuangan rumah tangga butuh transparansi untuk pos belanja
                            keluarga, namun setiap orang tetap berhak memiliki privasi atas
                            tabungan pribadinya. Vesper memberikan keseimbangan sempurna.
                        </p>

                        <div className="mt-8 space-y-4">
                            {benefits.map((item) => {
                                const Icon = item.icon
                                return (
                                    <div
                                        key={item.title}
                                        className="flex gap-4 rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-white/10 dark:bg-[#0D121F]/80"
                                    >
                                        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400">
                                            <Icon className="size-5" />
                                        </span>
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                                {item.title}
                                            </h3>
                                            <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                                                {item.desc}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
