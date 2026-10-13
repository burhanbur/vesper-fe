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
import { useCreateBudget } from '../hooks/use-budgets'
import type { PeriodType } from '../types/budget'

interface BudgetFormDialogProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
}

export function BudgetFormDialog({
  open,
  onOpenChange,
}: BudgetFormDialogProps) {
  const [categoryId, setCategoryId] = useState('')
  const [amount, setAmount] = useState('')
  const [periodType, setPeriodType] = useState<PeriodType>('MONTHLY')
  const [anchorDate, setAnchorDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  )
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)

  const { data: categories = [] } = useCategories({ type: 'EXPENSE' })
  const createBudget = useCreateBudget()

  const selectedCategory = categoryId || (categories[0]?.id ?? '')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const numAmount = parseCurrency(amount)
    if (numAmount <= 0) {
      setError('Masukkan batas nominal anggaran yang valid.')
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
            <Target className="size-5 text-indigo-400" />
            Buat Alokasi Anggaran (Budget)
          </DialogTitle>
          <DialogDescription>
            Atur batas pengeluaran per kategori agar keuangan tetap terkendali.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error ? (
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400">
              {error}
            </div>
          ) : null}

          {/* Category */}
          <div className="space-y-1.5">
            <label
              className="text-xs font-medium text-slate-300"
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

          {/* Amount */}
          <div className="space-y-1.5">
            <label
              className="text-xs font-medium text-slate-300"
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

          {/* Period Type */}
          <div className="space-y-1.5">
            <label
              className="text-xs font-medium text-slate-300"
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
              className="text-xs font-medium text-slate-300"
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

          {/* Description */}
          <div className="space-y-1.5">
            <label
              className="text-xs font-medium text-slate-300"
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
            disabled={createBudget.isPending}
          >
            {createBudget.isPending ? 'Menyimpan…' : 'Simpan Anggaran'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  )
}
