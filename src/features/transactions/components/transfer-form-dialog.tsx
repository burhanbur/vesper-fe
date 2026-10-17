import { useMemo, useState } from 'react'
import {
  AlertCircle,
  ArrowDownUp,
  ArrowRightLeft,
  Clock,
  Sparkles,
} from 'lucide-react'
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
import { Select2, type Select2Option } from '@/components/ui/select2'
import {
  getAccountVisual,
  useAccounts,
  useAccountTypes,
} from '@/features/accounts'
import { parseCurrency, sanitizeCurrency } from '@/lib/currency'
import { formatRupiah } from '@/lib/formatters'
import { cn } from '@/lib/utils'
import { useCreateTransfer } from '../hooks/use-transactions'

interface TransferFormDialogProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
}

const QUICK_AMOUNT_PRESETS = [
  { label: '+50 rb', value: 50_000 },
  { label: '+100 rb', value: 100_000 },
  { label: '+250 rb', value: 250_000 },
  { label: '+500 rb', value: 500_000 },
  { label: '+1 jt', value: 1_000_000 },
]

const QUICK_NOTES = [
  'Top-up e-Wallet',
  'Pindah Tabungan',
  'Tarik Tunai',
  'Bayar Utang',
  'Bagi Saldo',
]

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
  const { data: accountTypes = [] } = useAccountTypes()
  const createTransfer = useCreateTransfer()

  const accountTypeMap = useMemo(() => {
    return new Map(accountTypes.map((t) => [t.id, t]))
  }, [accountTypes])

  const selectedFrom = fromAccountId || (accounts[0]?.id ?? '')
  const selectedTo =
    toAccountId ||
    (accounts.find((a) => a.id !== selectedFrom)?.id ?? accounts[0]?.id ?? '')

  const fromAccount = useMemo(
    () => accounts.find((a) => a.id === selectedFrom),
    [accounts, selectedFrom],
  )
  const toAccount = useMemo(
    () => accounts.find((a) => a.id === selectedTo),
    [accounts, selectedTo],
  )

  const accountOptions = useMemo<Select2Option[]>(() => {
    return accounts.map((acc) => {
      const accType = accountTypeMap.get(acc.account_type_id)
      const visual = getAccountVisual(acc, accType)
      const VisualIcon = visual.icon

      return {
        value: acc.id,
        label: acc.name,
        badge: visual.brandBadge ?? accType?.name,
        description: `Saldo: ${formatRupiah(acc.balance)}`,
        icon: (
          <div
            className={cn(
              'grid size-6 shrink-0 place-items-center rounded-md border text-xs',
              visual.badgeBg,
              visual.badgeBorder,
              visual.badgeText,
            )}
          >
            <VisualIcon className="size-3.5" />
          </div>
        ),
      }
    })
  }, [accounts, accountTypeMap])

  const numAmount = parseCurrency(amount)
  const fromBalanceNum = fromAccount ? Number(fromAccount.balance) : 0
  const toBalanceNum = toAccount ? Number(toAccount.balance) : 0
  const newFromBalance = fromBalanceNum - numAmount
  const newToBalance = toBalanceNum + numAmount
  const isInsufficientBalance = Boolean(
    fromAccount && numAmount > 0 && numAmount > fromBalanceNum,
  )

  function handleSwapAccounts() {
    const currentFrom = selectedFrom
    const currentTo = selectedTo
    setFromAccountId(currentTo)
    setToAccountId(currentFrom)
  }

  function handleFromChange(val: string) {
    setFromAccountId(val)
    if (val === selectedTo) {
      const other = accounts.find((a) => a.id !== val)
      if (other) {
        setToAccountId(other.id)
      }
    }
  }

  function handleToChange(val: string) {
    setToAccountId(val)
    if (val === selectedFrom) {
      const other = accounts.find((a) => a.id !== val)
      if (other) {
        setFromAccountId(other.id)
      }
    }
  }

  function handleAddAmount(delta: number) {
    const current = parseCurrency(amount)
    const next = current + delta
    setAmount(next.toString())
  }

  function handleSetAllBalance() {
    if (!fromAccount) return
    const bal = Math.max(0, Math.floor(Number(fromAccount.balance)))
    setAmount(bal.toString())
  }

  function resetForm() {
    setAmount('')
    setDescription('')
    setError(null)
    setDate(new Date().toISOString().slice(0, 16))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (selectedFrom === selectedTo) {
      setError('Akun asal dan akun tujuan harus berbeda.')
      return
    }

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
      resetForm()
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
          <div className="flex items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-600 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-400">
              <ArrowRightLeft className="size-5" />
            </div>
            <div>
              <DialogTitle>Transfer Antar Akun</DialogTitle>
              <DialogDescription>
                Pindahkan saldo antar rekening, dompet digital, atau kantong
                keuangan.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error ? (
            <div className="rounded-xl border border-rose-300/70 bg-rose-50/80 p-3 text-xs text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
              {error}
            </div>
          ) : null}

          {accounts.length < 2 ? (
            <div className="rounded-xl border border-amber-300/70 bg-amber-50/70 p-3 text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
              Minimal diperlukan 2 akun untuk melakukan transfer antar akun.
              Silakan tambah akun baru terlebih dahulu.
            </div>
          ) : null}

          {/* Interactive Transfer Flow Card */}
          <div className="relative rounded-2xl border border-slate-200/90 bg-slate-50/70 p-3.5 sm:p-4 dark:border-slate-800 dark:bg-slate-900/60">
            {/* From Account */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  Dari Akun (Sumber Dana)
                </span>
                {fromAccount ? (
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Saldo:{' '}
                    <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                      {formatRupiah(fromAccount.balance)}
                    </span>
                  </span>
                ) : null}
              </div>
              <Select2
                options={accountOptions}
                value={selectedFrom}
                onChange={handleFromChange}
                placeholder="Pilih akun sumber..."
              />
            </div>

            {/* Swap Divider & Button */}
            <div className="relative my-3 flex items-center justify-center">
              <div
                className="absolute inset-0 flex items-center"
                aria-hidden="true"
              >
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <button
                type="button"
                onClick={handleSwapAccounts}
                title="Tukar posisi akun sumber dan tujuan"
                className="group relative z-10 flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-xs transition-all hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-indigo-500 dark:hover:bg-slate-700 dark:hover:text-indigo-400"
              >
                <ArrowDownUp className="size-3.5 text-indigo-500 transition-transform duration-300 group-hover:rotate-180 dark:text-indigo-400" />
                <span>Tukar Posisi</span>
              </button>
            </div>

            {/* To Account */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  Ke Akun (Tujuan Dana)
                </span>
                {toAccount ? (
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Saldo:{' '}
                    <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                      {formatRupiah(toAccount.balance)}
                    </span>
                  </span>
                ) : null}
              </div>
              <Select2
                options={accountOptions}
                value={selectedTo}
                onChange={handleToChange}
                placeholder="Pilih akun tujuan..."
              />
            </div>

            {selectedFrom === selectedTo && accounts.length > 1 ? (
              <p className="mt-2 text-center text-[11px] font-medium text-rose-500 dark:text-rose-400">
                Akun asal dan akun tujuan harus berbeda.
              </p>
            ) : null}
          </div>

          {/* Amount Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label
                className="font-medium text-slate-700 dark:text-slate-300"
                htmlFor="tf-amount"
              >
                Nominal Transfer
              </label>
              {fromAccount && Number(fromAccount.balance) > 0 ? (
                <button
                  type="button"
                  onClick={handleSetAllBalance}
                  className="text-[11px] font-medium text-indigo-600 transition-colors hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  Transfer Semua Saldo
                </button>
              ) : null}
            </div>

            <CurrencyInput
              id="tf-amount"
              placeholder="0"
              value={amount}
              onRawChange={setAmount}
              showCompactBadge={true}
              showTerbilang={true}
              required
              className="h-11 text-base font-semibold text-slate-900 dark:text-slate-100"
            />

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              {QUICK_AMOUNT_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handleAddAmount(preset.value)}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-2xs transition-colors hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-600 active:scale-95 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:border-indigo-500/50 dark:hover:bg-indigo-950/30 dark:hover:text-indigo-300"
                >
                  {preset.label}
                </button>
              ))}
              {amount && parseCurrency(amount) > 0 ? (
                <button
                  type="button"
                  onClick={() => setAmount('')}
                  className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                >
                  Reset
                </button>
              ) : null}
            </div>

            {/* Over-balance warning */}
            {isInsufficientBalance ? (
              <div className="flex items-start gap-2 rounded-xl border border-amber-300/70 bg-amber-50/80 p-2.5 text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <div>
                  <p className="font-medium">
                    Nominal melebihi saldo akun sumber
                  </p>
                  <p className="mt-0.5 text-[11px] text-amber-700/90 dark:text-amber-300/80">
                    Saldo {fromAccount?.name} saat ini adalah{' '}
                    {formatRupiah(fromAccount?.balance ?? 0)}. Pastikan akun
                    sumber mengizinkan saldo negatif jika ini disengaja.
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          {/* Real-time Balance Simulation Card */}
          {numAmount > 0 &&
          selectedFrom !== selectedTo &&
          fromAccount &&
          toAccount ? (
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 text-xs transition-all dark:border-indigo-900/40 dark:bg-indigo-950/20">
              <div className="flex items-center justify-between border-b border-indigo-100/80 pb-2 dark:border-indigo-900/40">
                <div className="flex items-center gap-1.5 font-medium text-indigo-950 dark:text-indigo-200">
                  <Sparkles className="size-3.5 text-indigo-500" />
                  <span>Simulasi Saldo Setelah Transfer</span>
                </div>
                <span className="font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  {formatRupiah(numAmount)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 text-[11px]">
                <div>
                  <span className="block truncate font-medium text-slate-500 dark:text-slate-400">
                    {fromAccount.name} (Sumber)
                  </span>
                  <div className="mt-1 space-y-0.5 font-mono">
                    <div className="text-slate-400 line-through">
                      {formatRupiah(fromBalanceNum)}
                    </div>
                    <div
                      className={cn(
                        'font-bold',
                        newFromBalance < 0
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-slate-900 dark:text-slate-100',
                      )}
                    >
                      {formatRupiah(newFromBalance)}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="block truncate font-medium text-slate-500 dark:text-slate-400">
                    {toAccount.name} (Tujuan)
                  </span>
                  <div className="mt-1 space-y-0.5 font-mono">
                    <div className="text-slate-400 line-through">
                      {formatRupiah(toBalanceNum)}
                    </div>
                    <div className="font-bold text-emerald-600 dark:text-emerald-400">
                      {formatRupiah(newToBalance)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {/* Date & Time */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label
                className="font-medium text-slate-700 dark:text-slate-300"
                htmlFor="tf-date"
              >
                Tanggal & Waktu
              </label>
              <button
                type="button"
                onClick={() => setDate(new Date().toISOString().slice(0, 16))}
                className="flex items-center gap-1 text-[11px] font-medium text-indigo-600 transition-colors hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                <Clock className="size-3" />
                <span>Waktu Sekarang</span>
              </button>
            </div>
            <Input
              id="tf-date"
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="h-10 text-xs text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label
              className="text-xs font-medium text-slate-700 dark:text-slate-300"
              htmlFor="tf-desc"
            >
              Catatan (Opsional)
            </label>
            <Input
              id="tf-desc"
              placeholder="Contoh: Top-up GoPay atau Pindah tabungan bulanan"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-10 text-xs text-slate-900 dark:text-slate-100"
            />
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                Pilihan cepat:
              </span>
              {QUICK_NOTES.map((note) => {
                const isSelected = description === note
                return (
                  <button
                    key={note}
                    type="button"
                    onClick={() => setDescription(isSelected ? '' : note)}
                    className={cn(
                      'rounded-md border px-2 py-0.5 text-[11px] transition-colors',
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50 font-medium text-indigo-700 dark:border-indigo-500/50 dark:bg-indigo-950/40 dark:text-indigo-300'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200',
                    )}
                  >
                    {note}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
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
            disabled={
              createTransfer.isPending ||
              numAmount <= 0 ||
              selectedFrom === selectedTo ||
              accounts.length < 2
            }
            className="gap-2"
          >
            <ArrowRightLeft className="size-4" />
            {createTransfer.isPending
              ? 'Memproses Transfer...'
              : 'Kirim Transfer'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  )
}
