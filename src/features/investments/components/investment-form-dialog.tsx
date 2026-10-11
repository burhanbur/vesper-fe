import { useState } from 'react'
import { TrendingUp } from 'lucide-react'
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
import { useAccounts, useAccountTypes } from '@/features/accounts'
import {
  useCreateInvestmentTransaction,
  useInstruments,
} from '../hooks/use-investments'
import type { InvestmentTransactionType } from '../types/investment'

interface InvestmentFormDialogProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
}

export function InvestmentFormDialog({
  open,
  onOpenChange,
}: InvestmentFormDialogProps) {
  const [type, setType] = useState<InvestmentTransactionType>('BUY')
  const [instrumentId, setInstrumentId] = useState('')
  const [accountId, setAccountId] = useState('')
  const [cashAccountId, setCashAccountId] = useState('')
  const [quantity, setQuantity] = useState('')
  const [pricePerUnit, setPricePerUnit] = useState('')
  const [fee, setFee] = useState('0')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 16))
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)

  const { data: instruments = [] } = useInstruments()
  const { data: accounts = [] } = useAccounts()
  const { data: accountTypes = [] } = useAccountTypes()
  const createTx = useCreateInvestmentTransaction()

  // Filter accounts by type category if possible
  const investmentTypeIds = new Set(
    accountTypes.filter((t) => t.category === 'INVESTMENT').map((t) => t.id),
  )
  const investmentAccounts = accounts.filter(
    (a) =>
      investmentTypeIds.has(a.account_type_id) ||
      a.name.toLowerCase().includes('invest'),
  )
  const targetAccounts =
    investmentAccounts.length > 0 ? investmentAccounts : accounts

  const selectedInstrument = instrumentId || (instruments[0]?.id ?? '')
  const selectedAccount = accountId || (targetAccounts[0]?.id ?? '')
  const selectedCashAccount = cashAccountId || (accounts[0]?.id ?? '')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const qtyNum = parseFloat(quantity)
    const priceNum = parseFloat(pricePerUnit)

    if (Number.isNaN(qtyNum) || qtyNum <= 0) {
      setError('Masukkan kuantitas / unit yang valid.')
      return
    }

    if (Number.isNaN(priceNum) || priceNum <= 0) {
      setError('Masukkan harga per unit yang valid.')
      return
    }

    if (!selectedInstrument) {
      setError('Pilih instrumen investasi (saham, reksadana, crypto).')
      return
    }

    if (!selectedAccount) {
      setError('Pilih akun portofolio investasi.')
      return
    }

    try {
      await createTx.mutateAsync({
        instrument_id: selectedInstrument,
        account_id: selectedAccount,
        cash_account_id: selectedCashAccount || null,
        type,
        quantity: qtyNum.toString(),
        price_per_unit: priceNum.toString(),
        fee: parseFloat(fee || '0').toFixed(2),
        transacted_at: new Date(date).toISOString(),
        description: description.trim() || null,
      })
      setQuantity('')
      setPricePerUnit('')
      setDescription('')
      onOpenChange(false)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Gagal mencatat transaksi investasi.',
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <form onSubmit={(e) => void handleSubmit(e)}>
        <DialogHeader onClose={() => onOpenChange(false)}>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="size-5 text-indigo-400" />
            Catat Transaksi Investasi
          </DialogTitle>
          <DialogDescription>
            Catat pembelian, penjualan, atau dividen saham, reksadana, dan
            crypto.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error ? (
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400">
              {error}
            </div>
          ) : null}

          {/* Action Type */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setType('BUY')}
              className={`rounded-xl py-2 text-xs font-semibold transition-all ${
                type === 'BUY'
                  ? 'border border-emerald-500/40 bg-emerald-500/20 text-emerald-300 shadow-sm'
                  : 'border border-transparent bg-slate-800/60 text-slate-400'
              }`}
            >
              BELI (BUY)
            </button>
            <button
              type="button"
              onClick={() => setType('SELL')}
              className={`rounded-xl py-2 text-xs font-semibold transition-all ${
                type === 'SELL'
                  ? 'border border-rose-500/40 bg-rose-500/20 text-rose-300 shadow-sm'
                  : 'border border-transparent bg-slate-800/60 text-slate-400'
              }`}
            >
              JUAL (SELL)
            </button>
            <button
              type="button"
              onClick={() => setType('DIVIDEND')}
              className={`rounded-xl py-2 text-xs font-semibold transition-all ${
                type === 'DIVIDEND'
                  ? 'border border-indigo-500/40 bg-indigo-500/20 text-indigo-300 shadow-sm'
                  : 'border border-transparent bg-slate-800/60 text-slate-400'
              }`}
            >
              DIVIDEN
            </button>
          </div>

          {/* Instrument */}
          <div className="space-y-1.5">
            <label
              className="text-xs font-medium text-slate-300"
              htmlFor="inv-inst"
            >
              Instrumen
            </label>
            <Select
              id="inv-inst"
              value={selectedInstrument}
              onChange={(e) => setInstrumentId(e.target.value)}
            >
              {instruments.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.code} - {inst.name} ({inst.type})
                </option>
              ))}
            </Select>
          </div>

          {/* Portfolio Account */}
          <div className="space-y-1.5">
            <label
              className="text-xs font-medium text-slate-300"
              htmlFor="inv-acc"
            >
              Akun Portofolio Investasi
            </label>
            <Select
              id="inv-acc"
              value={selectedAccount}
              onChange={(e) => setAccountId(e.target.value)}
            >
              {targetAccounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </Select>
          </div>

          {/* Cash Account (Source / Destination) */}
          <div className="space-y-1.5">
            <label
              className="text-xs font-medium text-slate-300"
              htmlFor="inv-cash"
            >
              Akun Kas / Settlement (Rekening Dana Nasabah/Bank)
            </label>
            <Select
              id="inv-cash"
              value={selectedCashAccount}
              onChange={(e) => setCashAccountId(e.target.value)}
            >
              <option value="">-- Tanpa Akun Kas --</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </Select>
          </div>

          {/* Quantity & Price */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label
                className="text-xs font-medium text-slate-300"
                htmlFor="inv-qty"
              >
                Jumlah (Unit/Lot)
              </label>
              <Input
                id="inv-qty"
                type="number"
                step="any"
                min="0.00000001"
                placeholder="Contoh: 100"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label
                className="text-xs font-medium text-slate-300"
                htmlFor="inv-price"
              >
                Harga per Unit (Rp)
              </label>
              <Input
                id="inv-price"
                type="number"
                step="any"
                min="0.00000001"
                placeholder="Contoh: 9500"
                value={pricePerUnit}
                onChange={(e) => setPricePerUnit(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Fee & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label
                className="text-xs font-medium text-slate-300"
                htmlFor="inv-fee"
              >
                Biaya Transaksi / Fee (Rp)
              </label>
              <Input
                id="inv-fee"
                type="number"
                step="any"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label
                className="text-xs font-medium text-slate-300"
                htmlFor="inv-date"
              >
                Tanggal & Waktu
              </label>
              <Input
                id="inv-date"
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label
              className="text-xs font-medium text-slate-300"
              htmlFor="inv-desc"
            >
              Catatan (Opsional)
            </label>
            <Input
              id="inv-desc"
              placeholder="Catatan transaksi..."
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
          <Button type="submit" variant="emerald" disabled={createTx.isPending}>
            {createTx.isPending ? 'Memproses…' : 'Simpan Transaksi'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  )
}
