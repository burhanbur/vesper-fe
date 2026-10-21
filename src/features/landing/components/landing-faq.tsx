import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

export function LandingFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    {
      q: 'Apakah Vesper gratis untuk digunakan?',
      a: 'Ya! Seluruh fitur utama Vesper — mulai dari pencatatan pengeluaran harian, kantong rekening, pencatatan utang-piutang, pantau portofolio investasi, keuangan bersama keluarga, hingga impor dari Money Manager — dapat Anda gunakan secara penuh tanpa biaya berlangganan tersembunyi.',
    },
    {
      q: 'Bagaimana cara kerja aplikasi saat tidak ada koneksi internet?',
      a: 'Vesper menyimpan data secara langsung di ponsel atau laptop Anda terlebih dahulu. Setiap catatan pengeluaran langsung tersimpan seketika tanpa loading. Begitu perangkat Anda terhubung kembali ke internet, seluruh catatan akan otomatis tersinkronisasi dan dicadangkan ke akun cloud Anda.',
    },
    {
      q: 'Apakah pasangan saya bisa melihat seluruh isi rekening pribadi saya di fitur keuangan bersama?',
      a: 'Sama sekali tidak. Vesper menerapkan perlindungan privasi ketat. Hanya rekening kas yang Anda pilih untuk dibagikan yang bisa dilihat bersama. Jika Anda mengirim uang dari rekening pribadi ke kas keluarga, pasangan Anda hanya melihat keterangan transfer masuk tanpa bisa melihat nomor rekening maupun sisa saldo tabungan pribadi Anda.',
    },
    {
      q: 'Instrumen investasi apa saja yang didukung oleh Vesper?',
      a: 'Vesper mendukung Saham Bursa Efek Indonesia (IDX), Logam Mulia / Emas Fisik Antam & UBS, Aset Kripto (Bitcoin, Ethereum, dan lainnya), serta Reksa Dana & Obligasi. Nilai perkiraan pasar dan untung/rugi secara otomatis terhitung ke dalam Total Kekayaan Bersih Anda.',
    },
    {
      q: 'Saya sudah memakai Money Manager selama bertahun-tahun, apakah bisa dipindahkan?',
      a: 'Sangat bisa! Vesper menyediakan fitur impor file Excel bawaan. Cukup ekspor catatan dari aplikasi Money Manager lama Anda lalu masukkan ke Vesper. Seluruh catatan rekening, kategori belanja, dan riwayat transaksi lampau Anda langsung tersusun rapi dalam hitungan detik.',
    },
    {
      q: 'Apakah data finansial saya aman dan tidak disalahgunakan?',
      a: 'Privasi Anda adalah prioritas utama kami. Vesper tidak menyisipkan pelacak pihak ketiga, tidak memasang iklan pinjaman online, dan tidak pernah menjual data belanja Anda kepada siapa pun. Semua data akun terlindungi dengan enkripsi keamanan standar industri.',
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
                    className={`ml-4 grid size-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500 transition-transform duration-200 dark:bg-slate-800 dark:text-slate-400 ${
                      isOpen
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
