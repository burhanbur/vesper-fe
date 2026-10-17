import { type SyntheticEvent, useMemo, useState } from 'react'
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Clock,
  Sparkles,
  Tag,
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
import { useCategories } from '@/features/categories'
import { parseCurrency, sanitizeCurrency } from '@/lib/currency'
import { formatRupiah } from '@/lib/formatters'
import { cn } from '@/lib/utils'
import { useCreateTransaction } from '../hooks/use-transactions'

interface TransactionFormDialogProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly initialType?: 'INCOME' | 'EXPENSE'
}

const QUICK_EXPENSE_PRESETS = [
  { label: '+10 rb', value: 10_000 },
  { label: '+25 rb', value: 25_000 },
  { label: '+50 rb', value: 50_000 },
  { label: '+100 rb', value: 100_000 },
  { label: '+250 rb', value: 250_000 },
  { label: '+500 rb', value: 500_000 },
]

const QUICK_INCOME_PRESETS = [
  { label: '+100 rb', value: 100_000 },
  { label: '+500 rb', value: 500_000 },
  { label: '+1 jt', value: 1_000_000 },
  { label: '+2 jt', value: 2_000_000 },
  { label: '+5 jt', value: 5_000_000 },
  { label: '+10 jt', value: 10_000_000 },
]

const QUICK_EXPENSE_NOTES = [
  'Makan & Minum',
  'Belanja Harian',
  'Bensin / Transport',
  'Tagihan Listrik',
  'Kopi / Nongkrong',
]

const QUICK_INCOME_NOTES = [
  'Gaji Bulanan',
  'Bonus',
  'Hasil Usaha',
  'Cashback',
  'Pengembalian Dana',
]

function getNoteClass(isSelected: boolean, type: 'INCOME' | 'EXPENSE'): string {
  if (!isSelected) {
    return 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
  }
  if (type === 'EXPENSE') {
    return 'border-rose-500 bg-rose-50 font-medium text-rose-700 dark:border-rose-500/50 dark:bg-rose-950/40 dark:text-rose-300'
  }
  return 'border-emerald-500 bg-emerald-50 font-medium text-emerald-700 dark:border-emerald-500/50 dark:bg-emerald-950/40 dark:text-emerald-300'
}

interface TransactionTypeSelectorProps {
  readonly type: 'INCOME' | 'EXPENSE'
  readonly onChange: (type: 'INCOME' | 'EXPENSE') => void
}

function TransactionTypeSelector({
  type,
  onChange,
}: TransactionTypeSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-200/80 bg-slate-100/70 p-1 dark:border-slate-800 dark:bg-slate-900/60">
      <button
        type="button"
        onClick={() => onChange('EXPENSE')}
        className={cn(
          'flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold transition-all select-none',
          type === 'EXPENSE'
            ? 'border border-rose-500/30 bg-white text-rose-600 shadow-xs dark:border-rose-500/40 dark:bg-rose-500/20 dark:text-rose-300'
            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200',
        )}
      >
        <ArrowDownRight className="size-4 text-rose-500" />
        <span>Pengeluaran</span>
      </button>
      <button
        type="button"
        onClick={() => onChange('INCOME')}
        className={cn(
          'flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold transition-all select-none',
          type === 'INCOME'
            ? 'border border-emerald-500/30 bg-white text-emerald-600 shadow-xs dark:border-emerald-500/40 dark:bg-emerald-500/20 dark:text-emerald-300'
            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200',
        )}
      >
        <ArrowUpRight className="size-4 text-emerald-500" />
        <span>Pemasukan</span>
      </button>
    </div>
  )
}

interface TransactionAmountSectionProps {
  readonly type: 'INCOME' | 'EXPENSE'
  readonly amount: string
  readonly onAmountChange: (amount: string) => void
  readonly onAddAmount: (delta: number) => void
  readonly isInsufficientBalance: boolean
  readonly currentAccountName?: string | undefined
  readonly currentAccountBalance?: string | number | undefined
}

function TransactionAmountSection({
  type,
  amount,
  onAmountChange,
  onAddAmount,
  isInsufficientBalance,
  currentAccountName,
  currentAccountBalance,
}: TransactionAmountSectionProps) {
  const presets =
    type === 'EXPENSE' ? QUICK_EXPENSE_PRESETS : QUICK_INCOME_PRESETS
  const numAmount = parseCurrency(amount)

  return (
    <div className="space-y-2">
      <label
        className="text-xs font-medium text-slate-700 dark:text-slate-300"
        htmlFor="tx-amount"
      >
        Nominal Transaksi
      </label>
      <CurrencyInput
        id="tx-amount"
        placeholder="0"
        value={amount}
        onRawChange={onAmountChange}
        showCompactBadge={true}
        showTerbilang={true}
        required
        className="h-11 text-base font-semibold text-slate-900 dark:text-slate-100"
      />

      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
        {presets.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => onAddAmount(preset.value)}
            className={cn(
              'rounded-lg border bg-white px-2.5 py-1 text-xs font-medium shadow-2xs transition-colors active:scale-95 dark:bg-slate-900/60',
              type === 'EXPENSE'
                ? 'border-slate-200 text-slate-700 hover:border-rose-300 hover:bg-rose-50/50 hover:text-rose-600 dark:border-slate-800 dark:text-slate-300 dark:hover:border-rose-500/50 dark:hover:bg-rose-950/30 dark:hover:text-rose-300'
                : 'border-slate-200 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-600 dark:border-slate-800 dark:text-slate-300 dark:hover:border-emerald-500/50 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-300',
            )}
          >
            {preset.label}
          </button>
        ))}
        {numAmount > 0 ? (
          <button
            type="button"
            onClick={() => onAmountChange('')}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            Reset
          </button>
        ) : null}
      </div>

      {isInsufficientBalance ? (
        <div className="flex items-start gap-2 rounded-xl border border-amber-300/70 bg-amber-50/80 p-2.5 text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <p className="font-medium">Nominal melebihi saldo akun</p>
            <p className="mt-0.5 text-[11px] text-amber-700/90 dark:text-amber-300/80">
              Saldo {currentAccountName ?? 'akun'} saat ini adalah{' '}
              {formatRupiah(currentAccountBalance ?? 0)}. Pastikan akun
              mengizinkan saldo minus jika ini disengaja.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  )
}

interface TransactionSimulationCardProps {
  readonly type: 'INCOME' | 'EXPENSE'
  readonly accountName: string
  readonly currentBalance: number
  readonly newBalance: number
  readonly amount: number
}

function TransactionSimulationCard({
  type,
  accountName,
  currentBalance,
  newBalance,
  amount,
}: TransactionSimulationCardProps) {
  const isExpense = type === 'EXPENSE'
  const isNegative = isExpense && newBalance < 0

  return (
    <div
      className={cn(
        'rounded-xl border p-3 text-xs transition-all',
        isExpense
          ? 'border-rose-100 bg-rose-50/40 dark:border-rose-950/40 dark:bg-rose-950/20'
          : 'border-emerald-100 bg-emerald-50/40 dark:border-emerald-950/40 dark:bg-emerald-950/20',
      )}
    >
      <div
        className={cn(
          'flex items-center justify-between border-b pb-2',
          isExpense
            ? 'border-rose-100/80 dark:border-rose-900/30'
            : 'border-emerald-100/80 dark:border-emerald-900/30',
        )}
      >
        <div
          className={cn(
            'flex items-center gap-1.5 font-medium',
            isExpense
              ? 'text-rose-950 dark:text-rose-200'
              : 'text-emerald-950 dark:text-emerald-200',
          )}
        >
          <Sparkles
            className={cn(
              'size-3.5',
              isExpense ? 'text-rose-500' : 'text-emerald-500',
            )}
          />
          <span>Simulasi Saldo Rekening</span>
        </div>
        <span
          className={cn(
            'font-mono text-xs font-semibold',
            isExpense
              ? 'text-rose-600 dark:text-rose-400'
              : 'text-emerald-600 dark:text-emerald-400',
          )}
        >
          {isExpense ? '-' : '+'}
          {formatRupiah(amount)}
        </span>
      </div>

      <div className="flex items-center justify-between pt-2 text-[11px]">
        <div>
          <span className="block truncate font-medium text-slate-500 dark:text-slate-400">
            {accountName}
          </span>
          <span className="font-mono text-slate-400 line-through">
            {formatRupiah(currentBalance)}
          </span>
        </div>
        <div className="text-right">
          <span className="block text-slate-500 dark:text-slate-400">
            Saldo Setelah Transaksi
          </span>
          <span
            className={cn(
              'font-mono font-bold',
              isNegative
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-slate-900 dark:text-slate-100',
            )}
          >
            {formatRupiah(newBalance)}
          </span>
        </div>
      </div>
    </div>
  )
}

interface TransactionNoteSectionProps {
  readonly type: 'INCOME' | 'EXPENSE'
  readonly description: string
  readonly onDescriptionChange: (desc: string) => void
}

function TransactionNoteSection({
  type,
  description,
  onDescriptionChange,
}: TransactionNoteSectionProps) {
  const notes = type === 'EXPENSE' ? QUICK_EXPENSE_NOTES : QUICK_INCOME_NOTES
  const placeholder =
    type === 'EXPENSE'
      ? 'Contoh: Makan siang nasi padang'
      : 'Contoh: Gaji bulanan atau Dividen'

  return (
    <div className="space-y-1.5">
      <label
        className="text-xs font-medium text-slate-700 dark:text-slate-300"
        htmlFor="tx-desc"
      >
        Catatan / Deskripsi (Opsional)
      </label>
      <Input
        id="tx-desc"
        placeholder={placeholder}
        value={description}
        onChange={(e) => onDescriptionChange(e.target.value)}
        className="h-10 text-xs text-slate-900 dark:text-slate-100"
      />
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-[11px] text-slate-400 dark:text-slate-500">
          Pilihan cepat:
        </span>
        {notes.map((note) => {
          const isSelected = description === note
          return (
            <button
              key={note}
              type="button"
              onClick={() => onDescriptionChange(isSelected ? '' : note)}
              className={cn(
                'rounded-md border px-2 py-0.5 text-[11px] transition-colors',
                getNoteClass(isSelected, type),
              )}
            >
              {note}
            </button>
          )
        })}
      </div>
    </div>
  )
}

interface TransactionDialogHeaderProps {
  readonly type: 'INCOME' | 'EXPENSE'
  readonly onClose: () => void
}

function TransactionDialogHeader({
  type,
  onClose,
}: TransactionDialogHeaderProps) {
  const isExpense = type === 'EXPENSE'

  return (
    <DialogHeader onClose={onClose}>
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'grid size-10 shrink-0 place-items-center rounded-xl border text-sm',
            isExpense
              ? 'border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400'
              : 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400',
          )}
        >
          {isExpense ? (
            <ArrowDownRight className="size-5" />
          ) : (
            <ArrowUpRight className="size-5" />
          )}
        </div>
        <div>
          <DialogTitle>Catat Transaksi Baru</DialogTitle>
          <DialogDescription>
            Catat {isExpense ? 'pengeluaran' : 'pemasukan'} ke dalam akun
            keuangan Anda.
          </DialogDescription>
        </div>
      </div>
    </DialogHeader>
  )
}

interface TransactionAccountSectionProps {
  readonly selectedAccount: string
  readonly onAccountChange: (id: string) => void
  readonly accountOptions: Select2Option[]
  readonly currentAccountName?: string | undefined
  readonly currentAccountBalance?: string | number | undefined
}

function TransactionAccountSection({
  selectedAccount,
  onAccountChange,
  accountOptions,
  currentAccountName,
  currentAccountBalance,
}: TransactionAccountSectionProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-700 dark:text-slate-300">
          Rekening / Akun
        </span>
        {currentAccountName ? (
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Saldo:{' '}
            <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
              {formatRupiah(currentAccountBalance ?? 0)}
            </span>
          </span>
        ) : null}
      </div>
      <Select2
        options={accountOptions}
        value={selectedAccount}
        onChange={onAccountChange}
        placeholder="Pilih rekening atau akun..."
      />
    </div>
  )
}

interface TransactionCategorySectionProps {
  readonly type: 'INCOME' | 'EXPENSE'
  readonly selectedCategory: string
  readonly onCategoryChange: (id: string) => void
  readonly categoryOptions: Select2Option[]
  readonly hasCategories: boolean
}

function TransactionCategorySection({
  type,
  selectedCategory,
  onCategoryChange,
  categoryOptions,
  hasCategories,
}: TransactionCategorySectionProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-700 dark:text-slate-300">
          Kategori
        </span>
        {hasCategories ? (
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            {categoryOptions.length} kategori tersedia
          </span>
        ) : null}
      </div>
      {!hasCategories ? (
        <div className="rounded-lg border border-amber-300/70 bg-amber-50/70 p-2.5 text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          Belum ada kategori {type === 'EXPENSE' ? 'pengeluaran' : 'pemasukan'}.
          Silakan buat kategori terlebih dahulu.
        </div>
      ) : (
        <Select2
          options={categoryOptions}
          value={selectedCategory}
          onChange={onCategoryChange}
          placeholder="Pilih atau cari kategori..."
        />
      )}
    </div>
  )
}

interface TransactionFormInnerProps {
  readonly initialType: 'INCOME' | 'EXPENSE'
  readonly onClose: () => void
}

function TransactionFormInner({
  initialType,
  onClose,
}: TransactionFormInnerProps) {
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>(initialType)
  const [accountId, setAccountId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 16))
  const [error, setError] = useState<string | null>(null)

  const { data: accounts = [] } = useAccounts()
  const { data: accountTypes = [] } = useAccountTypes()
  const { data: categories = [] } = useCategories({ type })
  const createTx = useCreateTransaction()

  const accountTypeMap = useMemo(() => {
    return new Map(accountTypes.map((t) => [t.id, t]))
  }, [accountTypes])

  // Default select first items when loaded
  const selectedAccount = accountId || (accounts[0]?.id ?? '')
  const selectedCategory = categoryId || (categories[0]?.id ?? '')

  const currentAccount = useMemo(
    () => accounts.find((a) => a.id === selectedAccount),
    [accounts, selectedAccount],
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

  const categoryOptions = useMemo<Select2Option[]>(() => {
    return categories.map((cat) => ({
      value: cat.id,
      label: cat.name,
      badge: cat.type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran',
      icon: (
        <div
          className={cn(
            'grid size-6 shrink-0 place-items-center rounded-md border text-xs',
            cat.type === 'INCOME'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400'
              : 'border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400',
          )}
        >
          <Tag className="size-3.5" />
        </div>
      ),
    }))
  }, [categories])

  const numAmount = parseCurrency(amount)
  const currentBalanceNum = currentAccount ? Number(currentAccount.balance) : 0
  const newBalance =
    type === 'EXPENSE'
      ? currentBalanceNum - numAmount
      : currentBalanceNum + numAmount
  const isInsufficientBalance = Boolean(
    type === 'EXPENSE' &&
    currentAccount &&
    numAmount > 0 &&
    numAmount > currentBalanceNum,
  )

  function handleTypeChange(nextType: 'INCOME' | 'EXPENSE') {
    setType(nextType)
    setCategoryId('')
  }

  function handleAddAmount(delta: number) {
    const current = parseCurrency(amount)
    const next = current + delta
    setAmount(next.toString())
  }

  function resetForm() {
    setAmount('')
    setDescription('')
    setError(null)
    setDate(new Date().toISOString().slice(0, 16))
  }

  async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

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
      resetForm()
      onClose()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Gagal menyimpan transaksi.',
      )
    }
  }

  const submitButtonLabel = useMemo(() => {
    if (createTx.isPending) return 'Menyimpan…'
    return type === 'EXPENSE' ? 'Simpan Pengeluaran' : 'Simpan Pemasukan'
  }, [createTx.isPending, type])

  return (
    <form onSubmit={(e) => void handleSubmit(e)}>
      <TransactionDialogHeader type={type} onClose={onClose} />

      <div className="space-y-4 py-4">
        {error ? (
          <div className="rounded-xl border border-rose-300/70 bg-rose-50/80 p-3 text-xs text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
            {error}
          </div>
        ) : null}

        {/* Type Selector (Segmented Control) */}
        <TransactionTypeSelector type={type} onChange={handleTypeChange} />

        {/* Amount Section */}
        <TransactionAmountSection
          type={type}
          amount={amount}
          onAmountChange={setAmount}
          onAddAmount={handleAddAmount}
          isInsufficientBalance={isInsufficientBalance}
          currentAccountName={currentAccount?.name}
          currentAccountBalance={currentAccount?.balance}
        />

        {/* Account Picker */}
        <TransactionAccountSection
          selectedAccount={selectedAccount}
          onAccountChange={setAccountId}
          accountOptions={accountOptions}
          currentAccountName={currentAccount?.name}
          currentAccountBalance={currentAccount?.balance}
        />

        {/* Category Picker */}
        <TransactionCategorySection
          type={type}
          selectedCategory={selectedCategory}
          onCategoryChange={setCategoryId}
          categoryOptions={categoryOptions}
          hasCategories={categories.length > 0}
        />

        {/* Balance Simulation Card */}
        {numAmount > 0 && currentAccount ? (
          <TransactionSimulationCard
            type={type}
            accountName={currentAccount.name}
            currentBalance={currentBalanceNum}
            newBalance={newBalance}
            amount={numAmount}
          />
        ) : null}

        {/* Date & Time */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label
              className="font-medium text-slate-700 dark:text-slate-300"
              htmlFor="tx-date"
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
            id="tx-date"
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="h-10 text-xs text-slate-900 dark:text-slate-100"
          />
        </div>

        {/* Description */}
        <TransactionNoteSection
          type={type}
          description={description}
          onDescriptionChange={setDescription}
        />
      </div>

      <DialogFooter className="gap-2 sm:gap-0">
        <Button type="button" variant="outline" onClick={onClose}>
          Batal
        </Button>
        <Button
          type="submit"
          variant={type === 'EXPENSE' ? 'destructive' : 'emerald'}
          disabled={
            createTx.isPending ||
            numAmount <= 0 ||
            !selectedAccount ||
            !selectedCategory
          }
          className="gap-2"
        >
          {type === 'EXPENSE' ? (
            <ArrowDownRight className="size-4" />
          ) : (
            <ArrowUpRight className="size-4" />
          )}
          {submitButtonLabel}
        </Button>
      </DialogFooter>
    </form>
  )
}

export function TransactionFormDialog({
  open,
  onOpenChange,
  initialType = 'EXPENSE',
}: TransactionFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <TransactionFormInner
          key={`${open}-${initialType}`}
          initialType={initialType}
          onClose={() => onOpenChange(false)}
        />
      ) : null}
    </Dialog>
  )
}
