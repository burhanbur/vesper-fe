import { useState } from 'react'
import { DollarSign } from 'lucide-react'
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
import { useCreatePrice, useInstruments } from '../hooks/use-investments'

interface PriceUpdateDialogProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly defaultInstrumentId?: string
}

export function PriceUpdateDialog({
  open,
  onOpenChange,
  defaultInstrumentId,
}: PriceUpdateDialogProps) {
  const [instrumentId, setInstrumentId] = useState(defaultInstrumentId ?? '')
  const [priceDate, setPriceDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  )
  const [closePrice, setClosePrice] = useState('')
  const [error, setError] = useState<string | null>(null)

  const { data: instruments = [] } = useInstruments()
  const createPrice = useCreatePrice()

  const selectedInstrument =
    instrumentId || defaultInstrumentId || (instruments[0]?.id ?? '')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const numPrice = parseFloat(closePrice)
    if (Number.isNaN(numPrice) || numPrice <= 0) {
      setError('Masukkan harga pasar yang valid.')
      return
    }

    if (!selectedInstrument) {
      setError('Pilih instrumen yang ingin diperbarui.')
      return
    }

    try {
      await createPrice.mutateAsync({
        instrument_id: selectedInstrument,
        price_date: priceDate,
        close_price: numPrice.toString(),
        source: 'MANUAL',
      })
      setClosePrice('')
      onOpenChange(false)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Gagal memperbarui harga pasar.',
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <form onSubmit={(e) => void handleSubmit(e)}>
        <DialogHeader onClose={() => onOpenChange(false)}>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="size-5 text-emerald-400" />
            Update Harga Pasar Hari Ini
          </DialogTitle>
          <DialogDescription>
            Perbarui harga penutupan instrumen untuk menghitung floating
            profit/loss real-time.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error ? (
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400">
              {error}
            </div>
          ) : null}

          {/* Instrument */}
          <div className="space-y-1.5">
            <label
              className="text-xs font-medium text-slate-300"
              htmlFor="pu-inst"
            >
              Instrumen
            </label>
            <Select
              id="pu-inst"
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

          {/* Date */}
          <div className="space-y-1.5">
            <label
              className="text-xs font-medium text-slate-300"
              htmlFor="pu-date"
            >
              Tanggal Harga
            </label>
            <Input
              id="pu-date"
              type="date"
              value={priceDate}
              onChange={(e) => setPriceDate(e.target.value)}
              required
            />
          </div>

          {/* Close Price */}
          <div className="space-y-1.5">
            <label
              className="text-xs font-medium text-slate-300"
              htmlFor="pu-price"
            >
              Harga Terkini / Close Price (Rp)
            </label>
            <Input
              id="pu-price"
              type="number"
              step="any"
              min="0.00000001"
              placeholder="Contoh: 10250"
              value={closePrice}
              onChange={(e) => setClosePrice(e.target.value)}
              required
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
            variant="emerald"
            disabled={createPrice.isPending}
          >
            {createPrice.isPending ? 'Menyimpan…' : 'Simpan Harga'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  )
}
