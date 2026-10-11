import { useState } from 'react'
import { Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import {
  useAccounts,
  useAccountTypes,
  useCreateAccount,
} from '../hooks/use-accounts'

interface AccountFormDialogProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
}

const ICONS = [
  { label: '🏦 Bank', value: 'bank' },
  { label: '💳 Dompet Digital / E-Wallet', value: 'wallet' },
  { label: '💵 Uang Tunai / Cash', value: 'cash' },
  { label: '📈 Saham / Reksadana', value: 'chart' },
  { label: '🪙 Crypto / Emas', value: 'coins' },
  { label: '🔒 Tabungan Berjangka', value: 'vault' },
  { label: '🤝 Utang / Piutang', value: 'handshake' },
]

export function AccountFormDialog({
  open,
  onOpenChange,
}: AccountFormDialogProps) {
  const [name, setName] = useState('')
  const [accountTypeId, setAccountTypeId] = useState('')
  const [parentAccountId, setParentAccountId] = useState('')
  const [icon, setIcon] = useState('bank')
  const [description, setDescription] = useState('')
  const [isIncludeTotal, setIsIncludeTotal] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { data: accountTypes = [] } = useAccountTypes()
  const { data: accounts = [] } = useAccounts()
  const createAccount = useCreateAccount()

  const selectedType = accountTypeId || (accountTypes[0]?.id ?? '')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Nama akun wajib diisi.')
      return
    }

    if (!selectedType) {
      setError('Pilih tipe akun.')
      return
    }

    try {
      await createAccount.mutateAsync({
        name: name.trim(),
        account_type_id: selectedType,
        parent_account_id: parentAccountId || null,
        icon,
        currency: 'IDR',
        description: description.trim() || null,
        is_include_total: isIncludeTotal,
        is_visible: true,
        sequence_order: '0',
      })
      setName('')
      setDescription('')
      setParentAccountId('')
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal membuat akun baru.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <form onSubmit={(e) => void handleSubmit(e)}>
        <DialogHeader onClose={() => onOpenChange(false)}>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="size-5 text-indigo-400" />
            Tambah Rekening / Akun Baru
          </DialogTitle>
          <DialogDescription>
            Daftarkan rekening bank, dompet digital, atau kantong keuangan baru.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error ? (
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400">
              {error}
            </div>
          ) : null}

          {/* Name */}
          <div className="space-y-1.5">
            <label
              className="text-xs font-medium text-slate-300"
              htmlFor="acc-name"
            >
              Nama Akun / Rekening
            </label>
            <Input
              id="acc-name"
              placeholder="Contoh: BCA Utama, Gopay, Kantong Tabungan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Account Type */}
          <div className="space-y-1.5">
            <label
              className="text-xs font-medium text-slate-300"
              htmlFor="acc-type"
            >
              Tipe Akun
            </label>
            <Select
              id="acc-type"
              value={selectedType}
              onChange={(e) => setAccountTypeId(e.target.value)}
            >
              {accountTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.category})
                </option>
              ))}
            </Select>
          </div>

          {/* Parent Account (Nested / Sub-pocket) */}
          <div className="space-y-1.5">
            <label
              className="text-xs font-medium text-slate-300"
              htmlFor="acc-parent"
            >
              Akun Induk (Opsional — untuk Sub-Kantong)
            </label>
            <Select
              id="acc-parent"
              value={parentAccountId}
              onChange={(e) => setParentAccountId(e.target.value)}
            >
              <option value="">-- Tidak ada (Akun Utama / Mandiri) --</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </Select>
            <p className="text-[11px] text-slate-500">
              Pilih akun induk jika ini adalah pocket/kantong di dalam bank yang
              sama.
            </p>
          </div>

          {/* Icon */}
          <div className="space-y-1.5">
            <label
              className="text-xs font-medium text-slate-300"
              htmlFor="acc-icon"
            >
              Ikon Tampilan
            </label>
            <Select
              id="acc-icon"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
            >
              {ICONS.map((ic) => (
                <option key={ic.value} value={ic.value}>
                  {ic.label}
                </option>
              ))}
            </Select>
          </div>

          {/* Checkbox include total */}
          <div className="flex items-center gap-2.5 pt-1">
            <input
              type="checkbox"
              id="acc-include-total"
              checked={isIncludeTotal}
              onChange={(e) => setIsIncludeTotal(e.target.checked)}
              className="size-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
            />
            <label
              htmlFor="acc-include-total"
              className="cursor-pointer text-xs font-medium text-slate-300"
            >
              Sertakan dalam perhitungan Total Kekayaan (Net Worth)
            </label>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label
              className="text-xs font-medium text-slate-300"
              htmlFor="acc-desc"
            >
              Deskripsi (Opsional)
            </label>
            <Input
              id="acc-desc"
              placeholder="Catatan rekening..."
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
            disabled={createAccount.isPending}
          >
            {createAccount.isPending ? 'Menyimpan…' : 'Simpan Akun'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  )
}
