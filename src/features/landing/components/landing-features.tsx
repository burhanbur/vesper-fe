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
      title: 'Kantong Tabungan & Belanja Terpisah',
      tag: 'Organisasi Rekening',
      description:
        'Kelola rekening seperti pos belanja di Bank Jago & BCA. Buat pos belanja dapur, tabungan liburan, atau dana darurat di bawah bank induk tanpa risiko dobel hitung saldo total.',
      icon: FolderTree,
      color: 'indigo',
      highlights: [
        'Saldo terbagi rapi tanpa takut dobel hitung',
        'Pilihan kantong utama otomatis saat mencatat',
        'Urutan kantong mudah diatur sesuai kebutuhan',
      ],
    },
    {
      id: 'multi-asset',
      title: 'Pantau Seluruh Portofolio Investasi',
      tag: 'Kekayaan Terpadu',
      description:
        'Lacak perkembangan seluruh aset Anda di satu tempat: Saham, Reksa Dana, Kripto, hingga Emas Batangan Antam dengan harga beli rata-rata dan estimasi untung/rugi terkini.',
      icon: TrendingUp,
      color: 'emerald',
      highlights: [
        'Perhitungan harga beli rata-rata & keuntungan',
        'Otomatis menambah nilai kekayaan bersih Anda',
        'Grafik perkembangan portofolio harian',
      ],
    },
    {
      id: 'family-group',
      title: 'Keuangan Pasutri & Pos Belanja Keluarga',
      tag: 'Finansial Keluarga',
      description:
        'Kelola anggaran rumah tangga bersama pasangan dengan tenang. Rekening pribadi Anda tetap dirahasiakan sehingga tidak terlihat oleh pasangan.',
      icon: Users,
      color: 'purple',
      highlights: [
        'Akses bersama untuk pos belanja rumah tangga',
        'Nomor & saldo rekening pribadi tetap rahasia',
        'Jelas siapa yang mencatat tiap pengeluaran',
      ],
    },
    {
      id: 'offline-first',
      title: 'Tetap Berfungsi Tanpa Koneksi Internet',
      tag: 'Bisa Tanpa Kuota',
      description:
        'Catat transaksi seketika saat di basement parkir mall atau saat tidak ada sinyal. Catatan tersimpan aman di perangkat Anda dan otomatis sinkron saat ada internet.',
      icon: WifiOff,
      color: 'sky',
      highlights: [
        'Catat instan tanpa perlu menunggu loading',
        'Otomatis tersinkron begitu ada internet',
        'Catatan aman tanpa risiko tertimpa',
      ],
    },
    {
      id: 'debt-management',
      title: 'Pencatatan Utang & Piutang Rapi',
      tag: 'Bebas Lupa',
      description:
        'Lupakan coretan di buku atau chat WhatsApp yang tenggelam. Catat pinjaman dan piutang ke pos khusus agar tidak mengacaukan uang belanja harian Anda.',
      icon: HandCoins,
      color: 'amber',
      highlights: [
        'Tombol cepat catat pinjaman & piutang',
        'Otomatis memotong atau menambah nilai kekayaan',
        'Pantau cicilan & pelunasan bertahap dengan mudah',
      ],
    },
    {
      id: 'instant-migration',
      title: 'Pindah dari Money Manager Sekali Klik',
      tag: 'Pindah Mudah',
      description:
        'Sudah pakai Money Manager bertahun-tahun? Jangan mulai dari awal. Unggah file Excel (.xls) dan seluruh rekening, pos belanja, serta riwayat lama Anda akan langsung tersalin rapi.',
      icon: FileSpreadsheet,
      color: 'teal',
      highlights: [
        'Baca file cadangan Excel secara aman',
        'Otomatis mengenali nama bank & pos belanja',
        'Catatan transaksi bertahun-tahun tetap utuh',
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
