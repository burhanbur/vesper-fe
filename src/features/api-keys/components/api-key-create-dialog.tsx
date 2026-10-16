import { Check, Copy, KeyRound, ShieldAlert } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useCreateApiKey } from '../hooks/use-api-keys'

interface ApiKeyCreateDialogProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
}

export function ApiKeyCreateDialog({
  open,
  onOpenChange,
}: ApiKeyCreateDialogProps) {
  const [name, setName] = useState('')
  const [application, setApplication] = useState('')
  const [description, setDescription] = useState('')
  const [rateLimit, setRateLimit] = useState('60')
  const [generatedKey, setGeneratedKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const createApiKey = useCreateApiKey()

  function reset() {
    setName('')
    setApplication('')
    setDescription('')
    setRateLimit('60')
    setGeneratedKey(null)
    setCopied(false)
  }

  function handleClose(nextOpen: boolean) {
    if (!nextOpen) {
      reset()
    }
    onOpenChange(nextOpen)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    try {
      const res = await createApiKey.mutateAsync({
        name: name.trim(),
        application: application.trim() || null,
        description: description.trim() || null,
        rate_limit: parseInt(rateLimit, 10) || 60,
      })
      setGeneratedKey(res.key)
      toast.success('API Key berhasil dibuat!')
    } catch {
      toast.error('Gagal membuat API Key baru.')
    }
  }

  async function handleCopyKey() {
    if (!generatedKey) return
    await navigator.clipboard.writeText(generatedKey)
    setCopied(true)
    toast.success('API Key disalin ke clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="animate-in fade-in zoom-in-95 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
              <KeyRound className="size-5 text-indigo-500 dark:text-indigo-400" />
              {generatedKey ? 'API Key Baru Dibuat' : 'Buat API Key Baru'}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
              {generatedKey
                ? 'Salin dan simpan kunci rahasia ini di tempat yang aman. Kunci ini hanya ditampilkan sekali.'
                : 'Buat token API untuk integrasi bot, script otomasi, atau aplikasi pihak ketiga.'}
            </DialogDescription>
          </DialogHeader>

          {generatedKey ? (
            <div className="mt-5 space-y-4">
              <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5">
                <ShieldAlert className="mt-0.5 size-5 shrink-0 text-amber-500 dark:text-amber-400" />
                <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-200/90">
                  Demi alasan keamanan, kunci API ini tidak akan pernah
                  ditampilkan kembali. Segera simpan sebelum menutup jendela
                  ini!
                </p>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="generated-api-key-val"
                  className="text-xs font-medium text-slate-700 dark:text-slate-300"
                >
                  Token Rahasia API
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    id="generated-api-key-val"
                    readOnly
                    value={generatedKey}
                    className="font-mono text-xs text-emerald-600 select-all selection:bg-emerald-500/30 dark:text-emerald-400"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="shrink-0"
                    onClick={() => void handleCopyKey()}
                  >
                    {copied ? (
                      <Check className="size-4 text-emerald-500 dark:text-emerald-400" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                  </Button>
                </div>
              </div>

              <DialogFooter className="mt-6">
                <Button
                  className="w-full bg-indigo-600 text-white hover:bg-indigo-500"
                  onClick={() => handleClose(false)}
                >
                  Saya Sudah Menyimpan Kunci Ini
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <form
              onSubmit={(e) => void handleSubmit(e)}
              className="mt-4 space-y-4"
            >
              <div className="space-y-1.5">
                <label
                  htmlFor="api-key-name"
                  className="text-xs font-medium text-slate-700 dark:text-slate-300"
                >
                  Nama Kunci <span className="text-rose-500">*</span>
                </label>
                <Input
                  id="api-key-name"
                  required
                  placeholder="Contoh: Zapier Sync, Mobile App Service"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="api-key-application"
                  className="text-xs font-medium text-slate-700 dark:text-slate-300"
                >
                  Nama Aplikasi / Klien (Opsional)
                </label>
                <Input
                  id="api-key-application"
                  placeholder="Contoh: Python Analytics, Telegram Bot"
                  value={application}
                  onChange={(e) => setApplication(e.target.value)}
                  className="text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="api-key-desc"
                  className="text-xs font-medium text-slate-700 dark:text-slate-300"
                >
                  Keterangan (Opsional)
                </label>
                <Input
                  id="api-key-desc"
                  placeholder="Keterangan kegunaan API Key..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="api-key-rate-limit"
                  className="text-xs font-medium text-slate-700 dark:text-slate-300"
                >
                  Batas Panggilan (Rate Limit per Menit)
                </label>
                <Input
                  id="api-key-rate-limit"
                  type="number"
                  min="1"
                  max="10000"
                  value={rateLimit}
                  onChange={(e) => setRateLimit(e.target.value)}
                  className="text-sm"
                />
              </div>

              <DialogFooter className="mt-6 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleClose(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={createApiKey.isPending || !name.trim()}
                  className="bg-indigo-600 font-medium text-white hover:bg-indigo-500"
                >
                  {createApiKey.isPending ? 'Membuat...' : 'Buat Kunci'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </div>
      </div>
    </Dialog>
  )
}
