import { useNavigate } from '@tanstack/react-router'
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FolderSync,
  HelpCircle,
  Loader2,
  Sparkles,
  UploadCloud,
  Wallet,
} from 'lucide-react'
import { useState, useRef, useMemo } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Select2, type Select2Option } from '@/components/ui/select2'
import { useAccounts, useAccountTypes } from '@/features/accounts'
import { useCategories } from '@/features/categories'
import { formatRupiah } from '@/lib/formatters'
import { useMoneyManagerImport } from '../hooks/use-money-manager-import'
import { categoryKey } from '../utils/category-key'
import type {
  ImportStep,
  MoneyManagerImportSummary,
  MoneyManagerRecord,
} from '../types/money-manager'
import {
  generateSampleMoneyManagerFile,
  parseMoneyManagerFile,
} from '../utils/money-manager-parser'

export function MoneyManagerWizard() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState<ImportStep>('upload')
  const [isParsing, setIsParsing] = useState(false)
  const [records, setRecords] = useState<MoneyManagerRecord[]>([])
  const [summary, setSummary] = useState<MoneyManagerImportSummary | null>(null)

  // Mappings: MM Name -> Vesper ID or 'NEW'
  const [accountMappings, setAccountMappings] = useState<
    Record<string, string>
  >({})
  const [categoryMappings, setCategoryMappings] = useState<
    Record<string, string>
  >({})

  // Queries
  const { data: vesperAccounts = [] } = useAccounts()
  const { data: vesperAccountTypes = [] } = useAccountTypes()
  const { data: vesperCategories = [] } = useCategories()

  // Map of account type ID to AccountTypeDto
  const accountTypeMap = useMemo(() => {
    return new Map(vesperAccountTypes.map((t) => [t.id, t]))
  }, [vesperAccountTypes])

  // Map of account ID to AccountDto for quick hierarchy lookup
  const accountMap = useMemo(() => {
    return new Map(vesperAccounts.map((a) => [a.id, a]))
  }, [vesperAccounts])

  // Set of all parent account IDs that currently have children
  const parentAccountIds = useMemo(() => {
    const ids = new Set<string>()
    for (const acc of vesperAccounts) {
      if (acc.parent_account_id) {
        ids.add(acc.parent_account_id)
      }
    }
    return ids
  }, [vesperAccounts])

  // Helper to format full hierarchical account display name (e.g. Jago - Main)
  const getAccountDisplayName = useMemo(() => {
    return (account: (typeof vesperAccounts)[number]): string => {
      const parts: string[] = [account.name]
      let currentParentId = account.parent_account_id
      const visited = new Set<string>([account.id])

      while (currentParentId && !visited.has(currentParentId)) {
        visited.add(currentParentId)
        const parent = accountMap.get(currentParentId)
        if (parent) {
          parts.unshift(parent.name)
          currentParentId = parent.parent_account_id
        } else {
          break
        }
      }

      return parts.join(' - ')
    }
  }, [accountMap])

  // Sorted Vesper accounts (only leaf/child accounts; parent accounts with children are excluded)
  const sortedVesperAccounts = useMemo(() => {
    return vesperAccounts
      .filter((acc) => !parentAccountIds.has(acc.id))
      .map((acc) => {
        let typeName = accountTypeMap.get(acc.account_type_id)?.name
        if (!typeName && acc.parent_account_id) {
          const parent = accountMap.get(acc.parent_account_id)
          if (parent) {
            typeName = accountTypeMap.get(parent.account_type_id)?.name
          }
        }
        return {
          id: acc.id,
          name: acc.name,
          displayName: getAccountDisplayName(acc),
          typeName,
        }
      })
      .sort((a, b) =>
        a.displayName.localeCompare(b.displayName, 'id-ID', {
          sensitivity: 'base',
          numeric: true,
        }),
      )
  }, [
    vesperAccounts,
    parentAccountIds,
    accountTypeMap,
    accountMap,
    getAccountDisplayName,
  ])

  // Select2 options for account mappings
  const accountOptions = useMemo<Select2Option[]>(() => {
    return [
      {
        value: 'NEW',
        label: 'Buat Akun Baru Otomatis',
        badge: 'Baru',
        icon: <Sparkles className="size-3.5 text-indigo-400" />,
      },
      ...sortedVesperAccounts.map((va) => ({
        value: va.id,
        label: va.displayName,
        badge: va.typeName,
        icon: <Wallet className="size-3.5 text-slate-400" />,
      })),
    ]
  }, [sortedVesperAccounts])

  // Sorted unique Money Manager accounts from summary
  const sortedUniqueAccounts = useMemo(() => {
    if (!summary) return []
    return [...summary.uniqueAccounts].sort((a, b) =>
      a.localeCompare(b, 'id-ID', { sensitivity: 'base', numeric: true }),
    )
  }, [summary])

  // Sorted unique Money Manager categories from summary
  const sortedUniqueCategories = useMemo(() => {
    if (!summary) return []
    return [...summary.uniqueCategories].sort((a, b) =>
      a.name.localeCompare(b.name, 'id-ID', {
        sensitivity: 'base',
        numeric: true,
      }),
    )
  }, [summary])

  // Import Hook
  const { progress, executeImport, resetProgress } = useMoneyManagerImport()

  async function handleFileSelected(file: File) {
    setIsParsing(true)
    try {
      const result = await parseMoneyManagerFile(file)
      setRecords(result.records)
      setSummary(result.summary)

      // Auto-match accounts
      const initialAccMap: Record<string, string> = {}
      result.summary.uniqueAccounts.forEach((mmAcc) => {
        const cleanMMAcc = mmAcc.toLowerCase().trim()
        const match = sortedVesperAccounts.find((va) => {
          const cleanDisplay = va.displayName.toLowerCase().trim()
          const cleanName = va.name.toLowerCase().trim()
          return cleanDisplay === cleanMMAcc || cleanName === cleanMMAcc
        })
        initialAccMap[mmAcc] = match ? match.id : 'NEW'
      })
      setAccountMappings(initialAccMap)

      // Auto-match categories
      const initialCatMap: Record<string, string> = {}
      result.summary.uniqueCategories.forEach((mmCat) => {
        const match = vesperCategories.find(
          (vc) =>
            categoryKey(vc.type, vc.name) ===
            categoryKey(mmCat.type, mmCat.name),
        )
        initialCatMap[categoryKey(mmCat.type, mmCat.name)] = match
          ? match.id
          : 'NEW'
      })
      setCategoryMappings(initialCatMap)

      setStep('preview')
      toast.success(
        `File berhasil dibaca! Ditemukan ${result.records.length} baris transaksi.`,
      )
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : 'Gagal membaca file Money Manager.',
      )
    } finally {
      setIsParsing(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      void handleFileSelected(file)
    }
  }

  function handleDownloadTemplate() {
    const blob = generateSampleMoneyManagerFile()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'contoh_ekspor_money_manager.xlsx'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success('Contoh format Money Manager diunduh!')
  }

  async function handleLoadSample() {
    const blob = generateSampleMoneyManagerFile()
    const file = new File([blob], 'money_manager_demo_sample.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    await handleFileSelected(file)
  }

  async function handleLoadRealUserFile() {
    setIsParsing(true)
    try {
      const response = await fetch('/2021-10-12_2026-10-31.xls')
      if (!response.ok) {
        throw new Error('Berkas 2021-10-12_2026-10-31.xls tidak dapat dimuat.')
      }
      const blob = await response.blob()
      const file = new File([blob], '2021-10-12_2026-10-31.xls', {
        type: 'application/vnd.ms-excel',
      })
      await handleFileSelected(file)
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : 'Gagal membaca berkas Money Manager.',
      )
    } finally {
      setIsParsing(false)
    }
  }

  async function handleStartMigration(importRecords = records) {
    setStep('importing')
    try {
      const result = await executeImport({
        records: importRecords,
        accountMappings,
        categoryMappings,
      })
      setStep('completed')
      if (result.errorCount > 0)
        toast.warning(
          'Migrasi belum berhasil sepenuhnya. Periksa rincian transaksi.',
        )
      else toast.success('Migrasi data selesai!')
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Terjadi kendala saat memproses migrasi data.',
      )
      setStep('preview')
    }
  }

  function handleRetryFailed() {
    const retryIndexes = new Set(
      progress.errors
        .filter((error) => error.retryable)
        .map((error) => error.index),
    )
    const failedRecords = records.filter((record) =>
      retryIndexes.has(record.rowIndex),
    )
    if (failedRecords.length > 0) void handleStartMigration(failedRecords)
  }

  function handleReset() {
    setStep('upload')
    setRecords([])
    setSummary(null)
    setAccountMappings({})
    setCategoryMappings({})
    resetProgress()
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Stepper Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-black text-white">
            <FolderSync className="size-6 text-indigo-400" />
            Migrasi Data dari Money Manager
          </h1>
          <p className="mt-0.5 text-xs text-slate-400">
            Pindahkan riwayat catatan keuangan Anda dari aplikasi Money Manager
            (Realbyte) ke Vesper.
          </p>
        </div>

        {/* Step Badge */}
        <Badge
          variant="outline"
          className="border-indigo-500/30 font-mono text-xs text-indigo-300"
        >
          Langkah{' '}
          {step === 'upload' ? '1/3' : step === 'preview' ? '2/3' : '3/3'}
        </Badge>
      </div>

      {/* STEP 1: UPLOAD */}
      {step === 'upload' ? (
        <div className="space-y-6">
          {/* Instructions Box */}
          <Card className="border-indigo-500/20 bg-indigo-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-bold text-indigo-300">
                <HelpCircle className="size-4" />
                Cara Ekspor Data dari HP Anda (Money Manager)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs leading-relaxed text-slate-300">
              <ol className="list-inside list-decimal space-y-1 text-slate-300">
                <li>
                  Buka aplikasi <strong>Money Manager</strong> di ponsel Android
                  atau iPhone Anda.
                </li>
                <li>
                  Pilih tab menu <strong>Lainnya (More / Setting)</strong> di
                  pojok bawah.
                </li>
                <li>
                  Buka submenu <strong>Cadangan (Backup)</strong> atau{' '}
                  <strong>Ekspor ke Excel (Export to Excel)</strong>.
                </li>
                <li>
                  Pilih rentang tanggal (pilih <strong>Semua Periode</strong>{' '}
                  untuk memindahkan seluruh tahun).
                </li>
                <li>
                  Kirim atau simpan file <code>.xlsx</code> atau{' '}
                  <code>.csv</code> ke komputer Anda, lalu unggah di bawah ini.
                </li>
              </ol>
            </CardContent>
          </Card>

          {/* Detected Real File Card */}
          <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 p-5 shadow-xl shadow-indigo-950/30 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3.5 sm:items-center">
              <div className="grid size-12 shrink-0 place-items-center rounded-xl border border-indigo-500/30 bg-indigo-500/20 text-indigo-400">
                <FileSpreadsheet className="size-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm font-bold text-white">
                    2021-10-12_2026-10-31.xls
                  </span>
                  <Badge
                    variant="default"
                    className="border-indigo-500/40 bg-indigo-500/20 text-[10px] text-indigo-300"
                  >
                    File Anda (4 Tahun Terdeteksi)
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  File ekspor Money Manager Anda telah terdeteksi di server
                  lokal (~5.018 transaksi siap diimpor).
                </p>
              </div>
            </div>

            <Button
              onClick={() => void handleLoadRealUserFile()}
              disabled={isParsing}
              className="h-10 w-full shrink-0 gap-2 bg-indigo-600 px-4 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 sm:w-auto"
            >
              {isParsing ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Membaca Data...
                </>
              ) : (
                <>
                  <Sparkles className="size-4 text-indigo-200" />
                  Gunakan File Ini Sekarang
                </>
              )}
            </Button>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div
            role="button"
            tabIndex={0}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                fileInputRef.current?.click()
              }
            }}
            className="group relative cursor-pointer rounded-2xl border-2 border-dashed border-slate-700 bg-slate-900/40 p-10 text-center transition-all duration-200 hover:border-indigo-500/80 hover:bg-slate-900/80"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv,.tsv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) void handleFileSelected(file)
              }}
            />

            {isParsing ? (
              <div className="flex flex-col items-center gap-3 py-6">
                <Loader2 className="size-10 animate-spin text-indigo-400" />
                <p className="text-sm font-semibold text-slate-200">
                  Menganalisis file Excel / CSV...
                </p>
                <p className="text-xs text-slate-400">
                  Mendeteksi kolom tanggal, akun, kategori, dan ratusan
                  transaksi...
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="grid size-14 place-items-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-400 transition-transform group-hover:scale-110">
                  <UploadCloud className="size-7" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Pilih atau Tarik File Cadangan Money Manager
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">
                    Mendukung format file{' '}
                    <strong>.xlsx, .xls, .csv, atau .tsv</strong>
                  </p>
                </div>
                <Button
                  size="sm"
                  className="pointer-events-none mt-2 bg-indigo-600 text-white hover:bg-indigo-500"
                >
                  Pilih File Dari Komputer
                </Button>
              </div>
            )}
          </div>

          {/* Quick Action Helpers */}
          <div className="flex flex-col items-center justify-between gap-3 pt-2 sm:flex-row">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadTemplate}
              className="gap-1.5 border-slate-800 text-xs text-slate-300 hover:bg-slate-800"
            >
              <Download className="size-3.5 text-indigo-400" />
              Unduh Contoh Format File Excel (.xlsx)
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => void handleLoadSample()}
              className="gap-1.5 border border-emerald-500/20 bg-emerald-500/10 text-xs text-emerald-300 hover:bg-emerald-500/20"
            >
              <Sparkles className="size-3.5 text-emerald-400" />
              Uji Coba dengan Data Sampel
            </Button>
          </div>
        </div>
      ) : null}

      {/* STEP 2: PREVIEW & MAPPING */}
      {step === 'preview' && summary ? (
        <div className="animate-in fade-in space-y-6 duration-200">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-slate-800 bg-slate-900/60 p-4">
              <span className="block text-[11px] font-medium tracking-wider text-slate-400 uppercase">
                Total Transaksi
              </span>
              <p className="mt-1 text-2xl font-black text-white">
                {summary.validRecordsCount} Transaksi
              </p>
              <span className="text-[11px] text-slate-500">
                Dari file: {summary.fileName}
              </span>
            </Card>

            <Card className="border-slate-800 bg-slate-900/60 p-4">
              <span className="block text-[11px] font-medium tracking-wider text-slate-400 uppercase">
                Rentang Waktu
              </span>
              <p className="mt-1 text-sm font-bold text-white">
                {summary.earliestDate || '-'} s/d {summary.latestDate || '-'}
              </p>
              <span className="text-[11px] text-indigo-400">
                Riwayat catatan terdeteksi
              </span>
            </Card>

            <Card className="border-emerald-500/20 bg-slate-900/60 p-4">
              <span className="block text-[11px] font-medium tracking-wider text-emerald-400 uppercase">
                Pemasukan ({summary.incomeCount})
              </span>
              <p className="mt-1 font-mono text-lg font-bold text-emerald-400">
                {formatRupiah(summary.totalIncomeAmount)}
              </p>
            </Card>

            <Card className="border-rose-500/20 bg-slate-900/60 p-4">
              <span className="block text-[11px] font-medium tracking-wider text-rose-400 uppercase">
                Pengeluaran ({summary.expenseCount})
              </span>
              <p className="mt-1 font-mono text-lg font-bold text-rose-400">
                {formatRupiah(summary.totalExpenseAmount)}
              </p>
            </Card>
          </div>

          {/* Account Mapping Review */}
          <Card className="space-y-4 p-5">
            <div>
              <h3 className="flex items-center gap-2 text-sm font-bold text-white">
                <Wallet className="size-4 text-indigo-400" />
                Pemetaan Rekening & Akun ({summary.uniqueAccounts.length} Akun)
              </h3>
              <p className="text-xs text-slate-400">
                Tentukan kemana transaksi dari Money Manager akan disimpan di
                Vesper.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {sortedUniqueAccounts.map((mmAcc) => {
                const currentVal = accountMappings[mmAcc] || 'NEW'
                return (
                  <div
                    key={mmAcc}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3"
                  >
                    <div className="min-w-0">
                      <span className="block truncate text-xs font-semibold text-slate-200">
                        {mmAcc}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Sumber Money Manager
                      </span>
                    </div>

                    <div className="w-60 shrink-0 sm:w-72">
                      <Select2
                        value={currentVal}
                        onChange={(val) =>
                          setAccountMappings((prev) => ({
                            ...prev,
                            [mmAcc]: val,
                          }))
                        }
                        options={accountOptions}
                        size="sm"
                        searchPlaceholder="Cari nama akun atau jenis..."
                        emptyMessage="Akun tidak ditemukan."
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Category Mapping Review */}
          <Card className="space-y-4 p-5">
            <div>
              <h3 className="flex items-center gap-2 text-sm font-bold text-white">
                <FileSpreadsheet className="size-4 text-emerald-400" />
                Kategori Transaksi ({summary.uniqueCategories.length} Kategori)
              </h3>
              <p className="text-xs text-slate-400">
                Kategori baru yang belum ada di Vesper akan dibuatkan otomatis.
              </p>
            </div>

            <div className="max-h-60 space-y-2 overflow-y-auto pr-1">
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3">
                {sortedUniqueCategories.map((mmCat) => (
                  <div
                    key={categoryKey(mmCat.type, mmCat.name)}
                    className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/40 p-2.5"
                  >
                    <span className="truncate text-xs font-medium text-slate-200">
                      {mmCat.name}
                    </span>
                    <Badge
                      variant={
                        mmCat.type === 'INCOME' ? 'success' : 'destructive'
                      }
                      className="text-[9px]"
                    >
                      {mmCat.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Sample Table Preview */}
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-slate-800 p-4">
              <CardTitle className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                Pratinjau Data (10 Baris Pertama)
              </CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 bg-slate-950 text-slate-400">
                  <tr>
                    <th className="p-3 font-semibold">Tanggal</th>
                    <th className="p-3 font-semibold">Akun</th>
                    <th className="p-3 font-semibold">Kategori</th>
                    <th className="p-3 font-semibold">Keterangan</th>
                    <th className="p-3 text-right font-semibold">Nominal</th>
                    <th className="p-3 text-center font-semibold">Tipe</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {records.slice(0, 10).map((r) => (
                    <tr key={r.rowIndex} className="hover:bg-slate-800/30">
                      <td className="p-3 font-mono text-[11px] whitespace-nowrap">
                        {r.displayDate}
                      </td>
                      <td className="p-3 font-medium text-slate-200">
                        {r.accountName}
                      </td>
                      <td className="p-3 text-slate-300">{r.categoryName}</td>
                      <td className="max-w-xs truncate p-3 text-slate-400">
                        {r.fullDescription}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-white">
                        {formatRupiah(r.amountFormatted)}
                      </td>
                      <td className="p-3 text-center">
                        <Badge
                          variant={
                            r.type === 'INCOME'
                              ? 'success'
                              : r.type === 'TRANSFER'
                                ? 'outline'
                                : 'destructive'
                          }
                          className="text-[10px]"
                        >
                          {r.type}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              onClick={handleReset}
              className="border-slate-800 text-slate-300"
            >
              Pilih File Lain
            </Button>

            <Button
              onClick={() => void handleStartMigration()}
              className="gap-2 bg-indigo-600 px-6 font-semibold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500"
            >
              Mulai Migrasi ke Vesper ({records.length} Transaksi)
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      ) : null}

      {/* STEP 3: IMPORTING PROGRESS */}
      {step === 'importing' ? (
        <Card className="space-y-6 p-8 text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl border border-indigo-500/30 bg-indigo-500/15 text-indigo-400">
            <Loader2 className="size-8 animate-spin" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">
              Sedang Memindahkan Data ke Vesper...
            </h2>
            <p className="text-xs text-slate-400">{progress.currentStatus}</p>
          </div>

          {/* Progress Bar */}
          <div className="mx-auto max-w-md space-y-2">
            <Progress value={progress.percentage} max={100} className="h-3.5" />
            <div className="flex items-center justify-between font-mono text-xs text-slate-400">
              <span>
                {progress.current} / {progress.total} transaksi
              </span>
              <span className="font-bold text-indigo-400">
                {progress.percentage}%
              </span>
            </div>
          </div>

          <p className="mx-auto max-w-sm text-[11px] text-slate-500">
            Proses berjalan dalam antrian batch aman agar saldo buku kas dan
            agregasi kantong rekening tetap akurat 100%. Jangan tutup halaman
            ini.
          </p>
        </Card>
      ) : null}

      {/* STEP 4: COMPLETED */}
      {step === 'completed' ? (
        <Card className="space-y-6 border-emerald-500/30 bg-emerald-950/10 p-8 text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl border border-emerald-500/30 bg-emerald-500/15 text-emerald-400">
            {progress.errorCount > 0 ? (
              <AlertCircle className="size-9 text-amber-400" />
            ) : (
              <CheckCircle2 className="size-9" />
            )}
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white">
              {progress.errorCount > 0
                ? 'Migrasi Belum Berhasil Sepenuhnya'
                : 'Migrasi Data Berhasil! 🎉'}
            </h2>
            <p className="mx-auto max-w-lg text-sm text-slate-300">
              {progress.errorCount > 0
                ? `${progress.successCount} transaksi berhasil diimpor; ${progress.errorCount} transaksi gagal atau belum diproses. Jangan impor ulang seluruh file karena transaksi yang sudah tersimpan dapat terduplikasi.`
                : 'Seluruh riwayat catatan keuangan Anda dari aplikasi Money Manager telah sukses dipindahkan ke Vesper.'}
            </p>
          </div>

          {/* Summary Stats */}
          <div className="mx-auto grid max-w-2xl grid-cols-2 gap-3 pt-2 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
              <span className="text-[10px] text-slate-400 uppercase">
                Sukses Diimpor
              </span>
              <p className="mt-0.5 font-mono text-xl font-bold text-emerald-400">
                {progress.successCount}
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
              <span className="text-[10px] text-slate-400 uppercase">
                Akun Dibuat
              </span>
              <p className="mt-0.5 font-mono text-xl font-bold text-indigo-400">
                {progress.accountsCreated}
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
              <span className="text-[10px] text-slate-400 uppercase">
                Kategori Dibuat
              </span>
              <p className="mt-0.5 font-mono text-xl font-bold text-cyan-400">
                {progress.categoriesCreated}
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
              <span className="text-[10px] text-slate-400 uppercase">
                Gagal / Lewat
              </span>
              <p className="mt-0.5 font-mono text-xl font-bold text-slate-400">
                {progress.errorCount}
              </p>
            </div>
          </div>

          {/* Error Details if any */}
          {progress.errors.length > 0 ? (
            <div className="mx-auto max-w-xl space-y-1 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-left text-xs text-amber-300">
              <div className="flex items-center gap-1.5 font-semibold">
                <AlertCircle className="size-4 shrink-0" />
                Catatan: {progress.errors.length} transaksi gagal atau belum
                diproses:
              </div>
              <ul className="max-h-24 list-inside list-disc space-y-0.5 overflow-y-auto text-[11px] text-amber-200/80">
                {progress.errors.slice(0, 5).map((e, idx) => (
                  <li key={idx}>
                    Baris {e.index}: {e.error} ({e.description})
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* Navigation Action Buttons */}
          <div className="flex flex-col items-center justify-center gap-3 pt-4 sm:flex-row">
            {progress.errors.some((error) => error.retryable) ? (
              <Button variant="outline" onClick={handleRetryFailed}>
                Coba ulang hanya transaksi gagal
              </Button>
            ) : null}
            <Button
              onClick={() => void navigate({ to: '/transactions' })}
              className="w-full gap-2 bg-indigo-600 font-semibold text-white hover:bg-indigo-500 sm:w-auto"
            >
              Lihat Riwayat Transaksi
              <ArrowRight className="size-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => void navigate({ to: '/dashboard' })}
              className="w-full border-slate-800 text-slate-300 hover:bg-slate-800 sm:w-auto"
            >
              Buka Dashboard
            </Button>
          </div>
        </Card>
      ) : null}
    </div>
  )
}
