import { useState } from 'react'
import { Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CurrencyInput } from '@/components/ui/currency-input'
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useCategories } from '@/features/categories'
import { parseCurrency, sanitizeCurrency } from '@/lib/currency'
import { useCreateBudget, useUpdateBudget } from '../hooks/use-budgets'
import type { BudgetDto, PeriodType } from '../types/budget'

interface BudgetFormDialogProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly budgetToEdit?: BudgetDto | null
}

export function BudgetFormDialog({
  open,
  onOpenChange,
  budgetToEdit,
}: BudgetFormDialogProps) {
  const isEdit = Boolean(budgetToEdit)

  const [categoryId, setCategoryId] = useState(
    budgetToEdit?.category_id ?? '',
  )
  const [amount, setAmount] = useState(
    budgetToEdit?.current_amount
      ? String(Math.round(parseFloat(budgetToEdit.current_amount)))
      : '',
  )
  const [periodType, setPeriodType] = useState<PeriodType>(
    budgetToEdit?.period_type ?? 'MONTHLY',
  )
  const [anchorDate, setAnchorDate] = useState(
    budgetToEdit?.anchor_date ??
      (() => new Date().toISOString().slice(0, 10)),
  )
  const [description, setDescription] = useState(
    budgetToEdit?.description ?? '',
  )
  const [error, setError] = useState<string | null>(null)

  const { data: categories = [] } = useCategories({ type: 'EXPENSE' })
  const createBudget = useCreateBudget()
  const updateBudget = useUpdateBudget()
  const isPending = isEdit ? updateBudget.isPending : createBudget.isPending

  const selectedCategory = categoryId || (categories[0]?.id ?? '')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const numAmount = parseCurrency(amount)
    if (numAmount <= 0) {
      setError('Masukkan batas nominal anggaran yang valid.')
      return
    }

    if (isEdit && budgetToEdit) {
      try {
        await updateBudget.mutateAsync({
          id: budgetToEdit.id,
          input: {
            amount: sanitizeCurrency(amount, { toFixed: 2 }),
            description: description.trim() || null,
          },
        })
        onOpenChange(false)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Gagal memperbarui anggaran.',
        )
      }
      return
    }

    if (!selectedCategory) {
      setError('Pilih kategori pengeluaran untuk anggaran.')
      return
    }

    try {
      await createBudget.mutateAsync({
        category_id: selectedCategory,
        amount: sanitizeCurrency(amount, { toFixed: 2 }),
        period_type: periodType,
        anchor_date: anchorDate,
        base_currency: 'IDR',
        description: description.trim() || null,
      })
      setAmount('')
      setDescription('')
      onOpenChange(false)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Gagal membuat anggaran baru.',
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <form onSubmit={(e) => void handleSubmit(e)}>
        <DialogHeader onClose={() => onOpenChange(false)}>
          <DialogTitle className="flex items-center gap-2">
            <Target className="size-5 text-indigo-600 dark:text-indigo-400" />
            {isEdit ? 'Edit Alokasi Anggaran' : 'Buat Alokasi Anggaran (Budget)'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Perbarui batas nominal anggaran atau catatan pengeluaran.'
              : 'Atur batas pengeluaran per kategori agar keuangan tetap terkendali.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error ? (
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-500 dark:text-rose-400">
              {error}
            </div>
          ) : null}

          {/* Category */}
          {isEdit ? (
            <div className="space-y-1.5">
              <label
                className="text-xs font-medium text-slate-700 dark:text-slate-300"
                htmlFor="bg-category-edit"
              >
                Kategori Pengeluaran
              </label>
              <Input
                id="bg-category-edit"
                value={
                  categories.find((c) => c.id === categoryId)?.name ||
                  'Kategori Terpilih'
                }
                disabled
                className="bg-slate-100 text-slate-500 dark:bg-slate-800/60 dark:text-slate-400"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Kategori dan jadwal terkunci untuk menjaga konsistensi audit riwayat anggaran.
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label
                className="text-xs font-medium text-slate-700 dark:text-slate-300"
                htmlFor="bg-category"
              >
                Kategori Pengeluaran
              </label>
              <Select
                id="bg-category"
                value={selectedCategory}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
          )}

          {/* Amount */}
          <div className="space-y-1.5">
            <label
              className="text-xs font-medium text-slate-700 dark:text-slate-300"
              htmlFor="bg-amount"
            >
              Batas Anggaran (Rp)
            </label>
            <CurrencyInput
              id="bg-amount"
              placeholder="Contoh: 1.500.000 atau 1.5jt"
              value={amount}
              onRawChange={setAmount}
              required
            />
          </div>

          {!isEdit ? (
            <>
              {/* Period Type */}
              <div className="space-y-1.5">
                <label
                  className="text-xs font-medium text-slate-700 dark:text-slate-300"
                  htmlFor="bg-period"
                >
                  Periode Anggaran
                </label>
                <Select
                  id="bg-period"
                  value={periodType}
                  onChange={(e) => setPeriodType(e.target.value as PeriodType)}
                >
                  <option value="MONTHLY">Bulanan (Monthly)</option>
                  <option value="WEEKLY">Mingguan (Weekly)</option>
                  <option value="DAILY">Harian (Daily)</option>
                  <option value="ANNUAL">Tahunan (Annual)</option>
                </Select>
              </div>

              {/* Anchor Date */}
              <div className="space-y-1.5">
                <label
                  className="text-xs font-medium text-slate-700 dark:text-slate-300"
                  htmlFor="bg-anchor"
                >
                  Tanggal Mulai (Anchor Date)
                </label>
                <Input
                  id="bg-anchor"
                  type="date"
                  value={anchorDate}
                  onChange={(e) => setAnchorDate(e.target.value)}
                  required
                />
              </div>
            </>
          ) : null}

          {/* Description */}
          <div className="space-y-1.5">
            <label
              className="text-xs font-medium text-slate-700 dark:text-slate-300"
              htmlFor="bg-desc"
            >
              Catatan (Opsional)
            </label>
            <Input
              id="bg-desc"
              placeholder="Contoh: Anggaran makan dan jajan bulanan"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Batal
          </Button>
          <Button
            type="submit"
            variant="default"
            disabled={isPending}
          >
            {isPending
              ? 'Menyimpan…'
              : isEdit
                ? 'Simpan Perubahan'
                : 'Simpan Anggaran'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  )
}
