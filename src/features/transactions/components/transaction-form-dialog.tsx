import { useState } from 'react'
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
import { useAccounts } from '@/features/accounts'
import { useCategories } from '@/features/categories'
import { parseCurrency, sanitizeCurrency } from '@/lib/currency'
import { useCreateTransaction } from '../hooks/use-transactions'

interface TransactionFormDialogProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly initialType?: 'INCOME' | 'EXPENSE'
}

export function TransactionFormDialog({
  open,
  onOpenChange,
  initialType = 'EXPENSE',
}: TransactionFormDialogProps) {
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>(initialType)
  const [accountId, setAccountId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 16))
  const [error, setError] = useState<string | null>(null)

  const { data: accounts = [] } = useAccounts()
  const { data: categories = [] } = useCategories({ type })
  const createTx = useCreateTransaction()

  // Default select first items when loaded
  const selectedAccount = accountId || (accounts[0]?.id ?? '')
  const selectedCategory = categoryId || (categories[0]?.id ?? '')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const numAmount = parseCurrency(amount)
    if (numAmount <= 0) {
      setError('Masukkan nominal transaksi yang valid.')
      return
    }

    if (!selectedAccount) {
      setError('Pilih akun / rekening.')
      return
    }

    if (!selectedCategory) {
      setError('Pilih kategori transaksi.')
      return
    }

    try {
      await createTx.mutateAsync({
        account_id: selectedAccount,
        category_id: selectedCategory,
        type,
        amount: sanitizeCurrency(amount, { toFixed: 2 }),
        transacted_at: new Date(date).toISOString(),
        description: description.trim() || null,
      })
      setAmount('')
      setDescription('')
      onOpenChange(false)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Gagal menyimpan transaksi.',
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <form onSubmit={(e) => void handleSubmit(e)}>
        <DialogHeader onClose={() => onOpenChange(false)}>
          <DialogTitle>Catat Transaksi Baru</DialogTitle>
          <DialogDescription>
            Catat pemasukan atau pengeluaran ke dalam akun keuangan Anda.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error ? (
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400">
              {error}
            </div>
          ) : null}

          {/* Type Selector */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setType('EXPENSE')
                setCategoryId('')
              }}
              className={`rounded-xl py-2.5 text-sm font-medium transition-all ${
                type === 'EXPENSE'
                  ? 'border border-rose-500/40 bg-rose-500/20 text-rose-300 shadow-sm'
                  : 'border border-transparent bg-slate-800/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              💸 Pengeluaran
            </button>
            <button
              type="button"
              onClick={() => {
                setType('INCOME')
                setCategoryId('')
              }}
              className={`rounded-xl py-2.5 text-sm font-medium transition-all ${
                type === 'INCOME'
                  ? 'border border-emerald-500/40 bg-emerald-500/20 text-emerald-300 shadow-sm'
                  : 'border border-transparent bg-slate-800/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              💰 Pemasukan
            </button>
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <label
              className="text-xs font-medium text-slate-300"
              htmlFor="tx-amount"
            >
              Nominal (Rp)
            </label>
            <CurrencyInput
              id="tx-amount"
              placeholder="Contoh: 50.000 atau 50k"
              value={amount}
              onRawChange={setAmount}
              required
            />
          </div>

          {/* Account */}
          <div className="space-y-1.5">
            <label
              className="text-xs font-medium text-slate-300"
              htmlFor="tx-account"
            >
              Rekening / Akun
            </label>
            <Select
              id="tx-account"
              value={selectedAccount}
              onChange={(e) => setAccountId(e.target.value)}
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.currency})
                </option>
              ))}
            </Select>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label
              className="text-xs font-medium text-slate-300"
              htmlFor="tx-category"
            >
              Kategori
            </label>
            <Select
              id="tx-category"
              value={selectedCategory}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </Select>
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <label
              className="text-xs font-medium text-slate-300"
              htmlFor="tx-date"
            >
              Tanggal & Waktu
            </label>
            <Input
              id="tx-date"
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label
              className="text-xs font-medium text-slate-300"
              htmlFor="tx-desc"
            >
              Catatan / Deskripsi (Opsional)
            </label>
            <Input
              id="tx-desc"
              placeholder="Contoh: Makan siang nasi padang"
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
            variant={type === 'EXPENSE' ? 'destructive' : 'emerald'}
            disabled={createTx.isPending}
          >
            {createTx.isPending ? 'Menyimpan…' : 'Simpan Transaksi'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  )
}
