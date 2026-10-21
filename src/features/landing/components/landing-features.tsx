import {
    FileSpreadsheet,
    FolderTree,
    HandCoins,
    TrendingUp,
    Users,
    WifiOff,
} from 'lucide-react'

export function LandingFeatures() {
    const features = [
        {
            id: 'nested-accounts',
            title: 'Nested Accounts & Bank Pocketing',
            tag: 'Organisasi Rekening',
            description:
                'Kelola rekening bertingkat ala Bank Jago & BCA. Buat kantong belanja, tabungan liburan, atau dana darurat di bawah bank induk tanpa risiko duplikasi saldo total.',
            icon: FolderTree,
            color: 'indigo',
            highlights: [
                'Hierarki induk-anak otomatis',
                'Prioritas default pocket saat catat transaksi',
                'Penyesuaian urutan akun fleksibel',
            ],
        },
        {
            id: 'multi-asset',
            title: 'Multi-Aset Portfolio & Wealth Tracker',
            tag: 'Kekayaan Terpadu',
            description:
                'Lacak seluruh portofolio investasi Anda di satu tempat: Saham IDX, Reksa Dana, Crypto, hingga Emas Fisik Antam dengan harga rata-rata dan floating profit/loss real-time.',
            icon: TrendingUp,
            color: 'emerald',
            highlights: [
                'Perhitungan Average Buy Cost & Realized P/L',
                'Integrasi nilai pasar ke Total Net Worth',
                'Riwayat snapshot portofolio harian',
            ],
        },
        {
            id: 'family-group',
            title: 'Grup Pasutri & Kolaborasi Cerdas',
            tag: 'Finansial Keluarga',
            description:
                'Kelola anggaran belanja bersama pasangan atau keluarga dengan aman. Fitur privacy masking otomatis menyamarkan nama rekening pribadi di mata anggota lain.',
            icon: Users,
            color: 'purple',
            highlights: [
                'Visibilitas akun bersama (Shared Pockets)',
                'Masking otomatis untuk rekening pribadi',
                'Audit jejak pencatat di setiap transaksi',
            ],
        },
        {
            id: 'offline-first',
            title: '100% Offline-First Architecture',
            tag: 'Performa Cepat',
            description:
                'Catat transaksi seketika di basement parkir mall atau dalam pesawat tanpa gangguan loading. Data tersimpan di SQLite lokal dan otomatis sinkron saat ada sinyal.',
            icon: WifiOff,
            color: 'sky',
            highlights: [
                'Optimistic write dengan respon 0 milidetik',
                'Outbox sync_queue teruji di latar belakang',
                'Resolusi konflik 409 yang transparan',
            ],
        },
        {
            id: 'debt-management',
            title: 'Pencatatan Utang & Piutang Akurat',
            tag: 'Kontrol Liabilitas',
            description:
                'Lupakan catatan manual di buku atau notes. Vesper memisahkan utang dan piutang ke akun khusus sehingga tidak mengacaukan arus kas riil Anda.',
            icon: HandCoins,
            color: 'amber',
            highlights: [
                'Shortcut khusus Catat Utang vs Piutang',
                'Otomatis mengurangi / menambah nilai bersih',
                'Rekonsiliasi pelunasan transfer mudah',
            ],
        },
        {
            id: 'instant-migration',
            title: 'Migrasi 1-Klik dari Money Manager',
            tag: 'Transisi Cepat',
            description:
                'Sudah pakai Money Manager selama bertahun-tahun? Jangan mulai dari nol. Unggah berkas Excel (.xls) dan seluruh akun, kategori, serta histori akan terimpor dalam hitungan detik.',
            icon: FileSpreadsheet,
            color: 'teal',
            highlights: [
                'Parsing file Excel langsung di browser',
                'Auto-mapping rekening dan kategori belanja',
                'Riwayat transaksi lampau tetap utuh',
            ],
        },
    ]

    return (
        <section id="fitur" className="scroll-mt-24 py-16 md:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="mx-auto max-w-3xl text-center">
                    <span className="rounded-full border border-indigo-200/80 bg-indigo-50/80 px-3 py-1 text-xs font-semibold tracking-wider text-indigo-700 uppercase dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-400">
                        Fitur Kelas Profesional
                    </span>
                    <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                        Dirancang untuk Mereka yang Menuntut Kontrol Finansial Riil
                    </h2>
                    <p className="mt-3 text-base text-slate-600 sm:text-lg dark:text-slate-300">
                        Tanpa trik AI murahan, tanpa banjir iklan pinjol. Setiap fitur di
                        Vesper dibangun untuk keandalan, kecepatan, dan kenyamanan hidup
                        sehari-hari.
                    </p>
                </div>

                {/* Feature Cards Grid */}
                <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map((item) => {
                        const Icon = item.icon
                        return (
                            <div
                                key={item.id}
                                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-xs backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg dark:border-white/10 dark:bg-[#0D121F]/80 dark:hover:border-indigo-500/40"
                            >
                                <div>
                                    <div className="flex items-center justify-between">
                                        <span className="grid size-11 place-items-center rounded-xl bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white dark:bg-indigo-500/15 dark:text-indigo-400 dark:group-hover:bg-indigo-600 dark:group-hover:text-white">
                                            <Icon className="size-5" />
                                        </span>
                                        <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                                            {item.tag}
                                        </span>
                                    </div>

                                    <h3 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">
                                        {item.title}
                                    </h3>

                                    <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                                        {item.description}
                                    </p>
                                </div>

                                <div className="mt-6 border-t border-slate-100 pt-4 dark:border-white/5">
                                    <ul className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                                        {item.highlights.map((point) => (
                                            <li key={point} className="flex items-center gap-2">
                                                <span className="size-1.5 rounded-full bg-indigo-500" />
                                                <span>{point}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
