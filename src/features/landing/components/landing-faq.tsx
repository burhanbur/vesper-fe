import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

export function LandingFaq() {
    const [openIndex, setOpenIndex] = useState<number | null>(0)

    const faqs = [
        {
            q: 'Apakah Vesper gratis untuk digunakan?',
            a: 'Ya! Seluruh fitur inti Vesper — mulai dari pencatatan kas harian, nested bank pockets, pencatatan utang-piutang, pelacak portofolio investasi, grup pasutri, hingga impor Money Manager — dapat Anda gunakan secara penuh tanpa biaya berlangganan tersembunyi.',
        },
        {
            q: 'Bagaimana cara kerja offline-first saat tidak ada koneksi internet?',
            a: 'Vesper menggunakan database lokal terenkripsi (SQLite/Drift) pada perangkat Anda. Setiap aksi tulis langsung diperbarui di antarmuka (0ms delay). Ketika perangkat Anda kembali tersambung ke internet, antrean transaksi (sync_queue) otomatis terkirim dan disinkronkan ke server cloud Express 5 & PostgreSQL.',
        },
        {
            q: 'Apakah pasangan saya bisa melihat seluruh isi rekening pribadi saya di fitur grup?',
            a: 'Sama sekali tidak. Vesper menerapkan teknologi Smart Data Masking. Hanya rekening yang Anda daftarkan ke grup yang bisa dilihat bersama. Jika Anda mengirim uang dari rekening pribadi ke kas keluarga, pasangan Anda hanya melihat "Ditransfer dari Rekening Pribadi milik [Nama]", tanpa mengetahui nomor rekening maupun total saldo pribadi Anda.',
        },
        {
            q: 'Instrumen investasi apa saja yang didukung oleh Vesper?',
            a: 'Vesper mendukung Saham Bursa Efek Indonesia (IDX), Logam Mulia / Emas Fisik Antam & UBS (gramatur desimal), Aset Kripto (Bitcoin, Ethereum, Altcoins), serta Reksa Dana & Obligasi. Nilai pasar dan floating profit/loss secara otomatis terintegrasi ke kalkulasi Total Net Worth Anda.',
        },
        {
            q: 'Saya sudah memakai Money Manager selama bertahun-tahun, apakah bisa dipindahkan?',
            a: 'Sangat bisa! Vesper memiliki fitur Impor Excel (.xls) bawaan. Cukup ekspor data dari aplikasi Money Manager lama Anda dan unggah ke Vesper. Sistem kami akan memetakan rekening, kategori pengeluaran, dan ratusan transaksi lampau Anda dalam beberapa detik.',
        },
        {
            q: 'Apakah data finansial saya aman dari penjualan data pihak ketiga?',
            a: 'Privasi adalah komitmen inti Vesper. Kami tidak menyisipkan pelacak pihak ketiga, tidak memasang iklan pinjol/fintech sponsor, dan tidak menjual profil belanja Anda. Data disimpan aman dengan enkripsi password Argon2id dan sesi token terproteksi.',
        },
    ]

    return (
        <section id="faq" className="scroll-mt-24 py-16 md:py-24">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <span className="rounded-full border border-indigo-200/80 bg-indigo-50/80 px-3 py-1 text-xs font-semibold tracking-wider text-indigo-700 uppercase dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-400">
                        Pertanyaan Umum
                    </span>
                    <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                        Kerap Ditanyakan Seputar Vesper
                    </h2>
                    <p className="mt-3 text-base text-slate-600 dark:text-slate-300">
                        Segala hal yang perlu Anda ketahui mengenai keamanan, privasi, dan
                        alur kerja Vesper.
                    </p>
                </div>

                <div className="mt-10 divide-y divide-slate-200/80 rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur-md sm:p-6 dark:divide-white/10 dark:border-white/10 dark:bg-[#0D121F]/80">
                    {faqs.map((faq, index) => {
                        const isOpen = openIndex === index
                        return (
                            <div key={faq.q} className="py-4 first:pt-0 last:pb-0">
                                <button
                                    type="button"
                                    onClick={() => setOpenIndex(isOpen ? null : index)}
                                    className="flex w-full items-center justify-between text-left transition-colors"
                                >
                                    <span className="text-sm font-bold text-slate-900 sm:text-base dark:text-white">
                                        {faq.q}
                                    </span>
                                    <span
                                        className={`ml-4 grid size-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500 transition-transform duration-200 dark:bg-slate-800 dark:text-slate-400 ${isOpen
                                                ? 'rotate-180 text-indigo-600 dark:text-indigo-400'
                                                : ''
                                            }`}
                                    >
                                        <ChevronDown className="size-4" />
                                    </span>
                                </button>

                                {isOpen && (
                                    <p className="mt-3 text-xs leading-relaxed text-slate-600 sm:text-sm dark:text-slate-300">
                                        {faq.a}
                                    </p>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
