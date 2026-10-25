import {
    CreditCard,
    Plus,
    ShieldAlert,
    Trash2,
    Wallet,
} from 'lucide-react'
import { useState, type SyntheticEvent } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
    Dialog,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { useAccounts } from '@/features/accounts'
import {
    useSharedAccounts,
    useShareAccountWithGroup,
    useUnshareAccountFromGroup,
} from '../hooks/use-groups'
import { formatNumber, formatRupiah } from '@/lib/formatters'

interface GroupAccountsViewProps {
    readonly groupId: string
}

function formatAccountBalance(
    balance: number | string | undefined,
    currency: string,
): string {
    if (balance === undefined) {
        return 'Rp 0'
    }
    if (currency === 'IDR') {
        return formatRupiah(balance)
    }
    return `${currency} ${formatNumber(balance)}`
}

export function GroupAccountsView({ groupId }: GroupAccountsViewProps) {
    const [shareModalOpen, setShareModalOpen] = useState(false)
    const [selectedAccountId, setSelectedAccountId] = useState('')
    const [unsharingAccount, setUnsharingAccount] = useState<{
        id: string
        name: string
    } | null>(null)

    const { data: sharedAccounts = [], isLoading } = useSharedAccounts(groupId)
    const { data: allAccounts = [] } = useAccounts()

    const shareAccount = useShareAccountWithGroup()
    const unshareAccount = useUnshareAccountFromGroup()

    // Filter accounts that are not yet shared
    const sharedAccountIds = new Set(sharedAccounts.map((s) => s.account_id))
    const availableAccounts = allAccounts.filter(
        (a) => !sharedAccountIds.has(a.id) && !a.deleted_at,
    )

    // Map to get live balance/currency for shared accounts
    const accountDetailsMap = new Map(allAccounts.map((a) => [a.id, a]))

    async function handleShareAccount(e: SyntheticEvent<HTMLFormElement>) {
        e.preventDefault()
        if (!selectedAccountId) return

        try {
            await shareAccount.mutateAsync({
                groupId,
                accountId: selectedAccountId,
            })
            setSelectedAccountId('')
            setShareModalOpen(false)
            toast.success('Rekening berhasil dibagikan ke grup!')
        } catch {
            toast.error('Gagal membagikan rekening.')
        }
    }

    async function handleConfirmUnshare() {
        if (!unsharingAccount) return

        try {
            await unshareAccount.mutateAsync({
                groupId,
                accountId: unsharingAccount.id,
            })
            toast.success(
                `Rekening "${unsharingAccount.name}" tidak lagi dibagikan ke grup.`,
            )
            setUnsharingAccount(null)
        } catch {
            toast.error('Gagal menghentikan pembagian rekening.')
        }
    }

    return (
        <div className="space-y-6">
            {/* Top action bar */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        Rekening Terhubung Anda
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Kelola rekening pribadi yang visibilitas saldo dan transaksinya Anda
                        bagikan ke grup ini.
                    </p>
                </div>

                <Button
                    onClick={() => {
                        setSelectedAccountId(availableAccounts[0]?.id || '')
                        setShareModalOpen(true)
                    }}
                    disabled={availableAccounts.length === 0}
                    className="gap-1.5"
                >
                    <Plus className="size-4" />
                    Bagikan Rekening Baru
                </Button>
            </div>

            {/* Info notice */}
            <div className="flex items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 dark:border-indigo-900/40 dark:bg-indigo-950/20">
                <ShieldAlert className="size-5 shrink-0 text-indigo-600 dark:text-indigo-400" />
                <div className="text-xs text-slate-600 dark:text-slate-300">
                    <p className="font-semibold text-slate-900 dark:text-white">
                        Transparansi Finansial yang Aman
                    </p>
                    <p className="mt-0.5 leading-relaxed">
                        Membagikan rekening hanya memberikan akses pandangan (view-only)
                        terhadap total saldo dan mutasi kas dalam grup. Rekening tetap berada
                        penuh di bawah kendali Anda dan dapat diputus kapan saja.
                    </p>
                </div>
            </div>

            {/* Accounts List */}
            {(() => {
                if (isLoading) {
                    return (
                        <Card className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
                            Memuat daftar rekening terhubung…
                        </Card>
                    )
                }
                if (sharedAccounts.length === 0) {
                    return (
                        <Card className="p-12 text-center">
                            <Wallet className="mx-auto mb-3 size-12 text-slate-400 dark:text-slate-600" />
                            <h4 className="text-base font-bold text-slate-900 dark:text-white">
                                Belum Ada Rekening Terhubung
                            </h4>
                            <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
                                Anda belum membagikan rekening pribadi apa pun ke grup ini. Bagikan
                                rekening untuk mulai mengumpulkan saldo bersama.
                            </p>
                            <Button
                                className="mt-4"
                                onClick={() => {
                                    setSelectedAccountId(availableAccounts[0]?.id || '')
                                    setShareModalOpen(true)
                                }}
                                disabled={availableAccounts.length === 0}
                            >
                                <Plus className="mr-1.5 size-4" /> Hubungkan Rekening
                            </Button>
                        </Card>
                    )
                }
                return (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {sharedAccounts.map((item) => {
                            const detail = accountDetailsMap.get(item.account_id)
                            const currency = detail?.currency || 'IDR'
                            const balance = detail?.balance

                            return (
                                <Card
                                    key={item.id}
                                    className="flex flex-col justify-between p-5 transition-all hover:border-slate-300 dark:hover:border-slate-700"
                                >
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2.5">
                                                <div className="grid size-9 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                                                    <CreditCard className="size-4" />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                                        {item.name}
                                                    </h4>
                                                    <span className="text-[10px] text-slate-400">
                                                        {currency}
                                                    </span>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="text-[10px]">
                                                Aktif
                                            </Badge>
                                        </div>

                                        <div className="mt-4">
                                            <span className="text-[11px] text-slate-400">
                                                Saldo Saat Ini:
                                            </span>
                                            <p className="text-lg font-extrabold text-slate-900 dark:text-white">
                                                {formatAccountBalance(balance, currency)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-5 border-t border-slate-100 pt-3 dark:border-slate-800">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                setUnsharingAccount({
                                                    id: item.account_id,
                                                    name: item.name,
                                                })
                                            }
                                            className="w-full justify-center gap-1.5 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/30"
                                        >
                                            <Trash2 className="size-3.5" />
                                            Hentikan Berbagi
                                        </Button>
                                    </div>
                                </Card>
                            )
                        })}
                    </div>
                )
            })()}

            {/* Share Account Dialog */}
            <Dialog open={shareModalOpen} onOpenChange={setShareModalOpen}>
                <form onSubmit={(e) => void handleShareAccount(e)}>
                    <DialogHeader onClose={() => setShareModalOpen(false)}>
                        <DialogTitle>Bagikan Rekening ke Grup</DialogTitle>
                        <DialogDescription>
                            Pilih salah satu rekening pribadi Anda untuk disinkronkan ke dalam
                            visibilitas grup.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {availableAccounts.length === 0 ? (
                            <p className="text-xs text-slate-500">
                                Semua rekening Anda sudah terhubung ke grup ini atau Anda belum
                                membuat rekening.
                            </p>
                        ) : (
                            <div className="space-y-2">
                                <label
                                    className="text-xs font-medium text-slate-700 dark:text-slate-300"
                                    htmlFor="acc-select"
                                >
                                    Pilih Rekening
                                </label>
                                <select
                                    id="acc-select"
                                    value={selectedAccountId}
                                    onChange={(e) => setSelectedAccountId(e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    required
                                >
                                    {availableAccounts.map((acc) => (
                                        <option key={acc.id} value={acc.id}>
                                            {acc.name} — (
                                            {acc.currency === 'IDR'
                                                ? formatRupiah(acc.balance)
                                                : `${acc.currency} ${formatNumber(acc.balance)}`}
                                            )
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShareModalOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={!selectedAccountId || shareAccount.isPending}
                        >
                            {shareAccount.isPending ? 'Menghubungkan…' : 'Bagikan Rekening'}
                        </Button>
                    </DialogFooter>
                </form>
            </Dialog>

            {/* Unshare Confirmation Dialog */}
            <Dialog
                open={Boolean(unsharingAccount)}
                onOpenChange={(open) => !open && setUnsharingAccount(null)}
            >
                <DialogHeader onClose={() => setUnsharingAccount(null)}>
                    <DialogTitle>Hentikan Berbagi Rekening?</DialogTitle>
                    <DialogDescription>
                        Rekening <strong>{unsharingAccount?.name}</strong> dan seluruh
                        mutasinya tidak akan lagi terlihat oleh anggota grup lain. Saldo kas
                        bersama akan langsung diperbarui.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="mt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setUnsharingAccount(null)}
                    >
                        Batal
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={() => void handleConfirmUnshare()}
                        disabled={unshareAccount.isPending}
                    >
                        {unshareAccount.isPending ? 'Memproses…' : 'Ya, Hentikan Berbagi'}
                    </Button>
                </DialogFooter>
            </Dialog>
        </div>
    )
}
