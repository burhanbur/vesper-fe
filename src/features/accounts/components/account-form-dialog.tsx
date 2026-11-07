import { useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { accountFormSchema } from '../schemas/account-schema'
import type { z } from 'zod'
import { Wallet } from 'lucide-react'
import { env } from '@/config/env'
import { ApiError } from '@/lib/api-error'
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
  const {
    register,
    control,
    setValue,
    reset,
    handleSubmit: submitForm,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      name: '',
      account_type_id: '',
      parent_account_id: '',
      icon: 'bank',
      description: '',
      is_include_total: true,
      is_credit_card: false,
      credit_limit: '',
    },
  })
  const isCreditCard = useWatch({ control, name: 'is_credit_card' })
  const submitting = useRef(false)
  const [error, setError] = useState<string | null>(null)
  const [uncertain, setUncertain] = useState(false)

  const { data: accountTypes = [] } = useAccountTypes()
  const { data: accounts = [] } = useAccounts()
  const createAccount = useCreateAccount()

  const eligibleTypes = accountTypes.filter(
    (type) => !isCreditCard || type.category === 'CASH',
  )

  async function handleSubmit(values: z.infer<typeof accountFormSchema>) {
    if (submitting.current || uncertain) return
    setError(null)
    if (values.is_credit_card && !env.enableCreditCardCreation) {
      setError(
        'Pembuatan kartu kredit belum tersedia. Akun dan riwayat yang ada tetap dapat dilihat.',
      )
      return
    }
    if (!eligibleTypes.some((type) => type.id === values.account_type_id)) {
      setError('Pilih tipe CASH untuk kartu kredit.')
      return
    }
    submitting.current = true
    try {
      await createAccount.mutateAsync({
        name: values.name,
        account_type_id: values.account_type_id,
        parent_account_id: isCreditCard
          ? null
          : values.parent_account_id || null,
        icon: values.icon,
        currency: 'IDR',
        description: values.description.trim() || null,
        is_include_total: values.is_include_total,
        is_credit_card: isCreditCard,
        credit_limit: isCreditCard ? values.credit_limit || null : null,
        is_visible: true,
        sequence_order: '0',
      })
      reset()
      onOpenChange(false)
    } catch (error) {
      const rejected =
        error instanceof ApiError &&
        error.status !== undefined &&
        error.status >= 400 &&
        error.status < 500 &&
        error.status !== 408
      setUncertain(!rejected)
      setError(
        rejected
          ? 'Akun ditolak. Periksa isian sebelum mencoba lagi.'
          : 'Hasil pembuatan akun belum dapat dipastikan. Periksa daftar akun sebelum mencatat ulang.',
      )
    } finally {
      submitting.current = false
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <form onSubmit={(e) => void submitForm(handleSubmit)(e)}>
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

          <label className="flex items-center gap-2 text-sm">
            <input
              disabled={!env.enableCreditCardCreation}
              type="checkbox"
              {...register('is_credit_card')}
              onChange={(event) => {
                setValue('is_credit_card', event.target.checked)
                setValue('account_type_id', '')
                setValue('parent_account_id', '')
              }}
            />
            Kartu Kredit (pribadi)
          </label>
          {!env.enableCreditCardCreation && (
            <p className="text-xs">
              Pembuatan kartu kredit belum tersedia. Akun dan riwayat yang ada
              tetap dapat dilihat.
            </p>
          )}
          {isCreditCard && (
            <>
              <p className="text-xs text-slate-500">
                Akun pribadi IDR, saldo awal nol, tanpa kantong atau berbagi
                grup. Jenis kartu tidak dapat diubah. Limit dan kelebihan bayar
                bukan kas likuid.
              </p>
              <label htmlFor="acc-limit" className="text-sm">
                Limit Kredit (opsional)
              </label>
              <Input
                id="acc-limit"
                inputMode="decimal"
                placeholder="1000000.00"
                {...register('credit_limit')}
              />
              <p className="text-xs">
                Kosongkan untuk Limit Tidak Dipantau. Gunakan titik untuk
                desimal.
              </p>
            </>
          )}
          {Object.keys(errors).length > 0 && (
            <p role="alert" className="text-sm text-rose-500">
              {Object.values(errors)
                .map((field) => field.message)
                .join(' ')}
            </p>
          )}
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
              {...register('name')}
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
            <Select id="acc-type" {...register('account_type_id')}>
              <option value="">Pilih tipe akun</option>
              {eligibleTypes.map((t) => (
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
              {...register('parent_account_id')}
              disabled={isCreditCard}
            >
              <option value="">-- Tidak ada (Akun Utama / Mandiri) --</option>
              {accounts
                .filter(
                  (account) => !account.is_credit_card && !account.deleted_at,
                )
                .map((acc) => (
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
            <Select id="acc-icon" {...register('icon')}>
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
              {...register('is_include_total')}
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
              {...register('description')}
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
            disabled={createAccount.isPending || uncertain}
          >
            {createAccount.isPending ? 'Menyimpan…' : 'Simpan Akun'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  )
}
