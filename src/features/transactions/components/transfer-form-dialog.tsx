import { useState } from 'react'
import { ArrowRightLeft } from 'lucide-react'
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
import { parseCurrency, sanitizeCurrency } from '@/lib/currency'
import { useCreateTransfer } from '../hooks/use-transactions'

interface TransferFormDialogProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
}

export function TransferFormDialog({
  open,
  onOpenChange,
}: TransferFormDialogProps) {
  const [fromAccountId, setFromAccountId] = useState('')
  const [toAccountId, setToAccountId] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 16))
  const [error, setError] = useState<string | null>(null)

  const { data: accounts = [] } = useAccounts()
  const createTransfer = useCreateTransfer()

  const selectedFrom = fromAccountId || (accounts[0]?.id ?? '')
  const selectedTo = toAccountId || (accounts[1]?.id ?? accounts[0]?.id ?? '')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (selectedFrom === selectedTo) {
      setError('Akun asal dan akun tujuan harus berbeda.')
      return
    }

    const numAmount = parseCurrency(amount)
    if (numAmount <= 0) {
      setError('Masukkan nominal transfer yang valid.')
      return
    }

    try {
      await createTransfer.mutateAsync({
        from_account_id: selectedFrom,
        to_account_id: selectedTo,
        amount: sanitizeCurrency(amount, { toFixed: 2 }),
        transacted_at: new Date(date).toISOString(),
        description: description.trim() || null,
      })
      setAmount('')
      setDescription('')
      onOpenChange(false)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Gagal melakukan transfer dana.',
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <form onSubmit={(e) => void handleSubmit(e)}>
        <DialogHeader onClose={() => onOpenChange(false)}>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="size-5 text-indigo-400" />
            Transfer Antar Akun
          </DialogTitle>
          <DialogDescription>
            Pindahkan saldo antar rekening, dompet digital, atau catat
            utang/piutang.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error ? (
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400">
              {error}
            </div>
          ) : null}

          {/* From Account */}
          <div className="space-y-1.5">
            <label
              className="text-xs font-medium text-slate-300"
              htmlFor="tf-from"
            >
              Dari Akun (Sumber Dana)
            </label>
            <Select
              id="tf-from"
              value={selectedFrom}
              onChange={(e) => setFromAccountId(e.target.value)}
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </Select>
          </div>

          {/* To Account */}
          <div className="space-y-1.5">
            <label
              className="text-xs font-medium text-slate-300"
              htmlFor="tf-to"
            >
              Ke Akun (Tujuan Dana)
            </label>
            <Select
              id="tf-to"
              value={selectedTo}
              onChange={(e) => setToAccountId(e.target.value)}
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </Select>
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <label
              className="text-xs font-medium text-slate-300"
              htmlFor="tf-amount"
            >
              Nominal (Rp)
            </label>
            <CurrencyInput
              id="tf-amount"
              placeholder="Contoh: 100.000 atau 100k"
              value={amount}
              onRawChange={setAmount}
              required
            />
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <label
              className="text-xs font-medium text-slate-300"
              htmlFor="tf-date"
            >
              Tanggal & Waktu
            </label>
            <Input
              id="tf-date"
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
              htmlFor="tf-desc"
            >
              Catatan (Opsional)
            </label>
            <Input
              id="tf-desc"
              placeholder="Contoh: Top-up Gopay atau Bayar hutang"
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
            disabled={createTransfer.isPending}
          >
            {createTransfer.isPending ? 'Memproses…' : 'Kirim Transfer'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  )
}
