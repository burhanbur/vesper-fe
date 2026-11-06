import {
    Edit3,
    PiggyBank,
    Plus,
    ShieldAlert,
    Trash2,
    Unlink,
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
import { Input } from '@/components/ui/input'
import { useAccounts } from '@/features/accounts'
import {
    useAssignAccountToGroupPocket,
    useCreateGroupPocket,
    useDeleteGroupPocket,
    useGroupPockets,
    useUnassignAccountFromGroupPocket,
    useUpdateGroupPocket,
} from '../hooks/use-groups'
import type { GroupPocketDto } from '../types/group'
import { formatNumber, formatRupiah } from '@/lib/formatters'

interface GroupPocketsViewProps {
    readonly groupId: string
}

function formatAccountBalance(
    balance: number | string | undefined,
    currency: string,
): string {
    if (balance === undefined || balance === null || balance === '') {
        return '0'
    }
    if (currency === 'IDR') {
        return formatRupiah(balance)
    }
    return `${currency} ${formatNumber(balance)}`
}

export function GroupPocketsView({ groupId }: GroupPocketsViewProps) {
    const [createModalOpen, setCreateModalOpen] = useState(false)
    const [newPocketName, setNewPocketName] = useState('')
    const [newPocketDesc, setNewPocketDesc] = useState('')

    const [managingPocket, setManagingPocket] = useState<GroupPocketDto | null>(
        null,
    )
    const [editName, setEditName] = useState('')
    const [editDesc, setEditDesc] = useState('')
    const [selectedAccountIdToAssign, setSelectedAccountIdToAssign] = useState('')
    const [deletingPocketId, setDeletingPocketId] = useState<string | null>(null)

    const { data: pockets = [], isLoading } = useGroupPockets(groupId)
    const { data: allAccounts = [] } = useAccounts()

    const createPocket = useCreateGroupPocket()
    const updatePocket = useUpdateGroupPocket()
    const deletePocket = useDeleteGroupPocket()
    const assignAccount = useAssignAccountToGroupPocket()
    const unassignAccount = useUnassignAccountFromGroupPocket()

    // Find live pocket details when managing
    const currentPocket = managingPocket
        ? pockets.find((p) => p.id === managingPocket.id) || managingPocket
        : null

    // Determine accounts already assigned to any pocket in this group
    const assignedAccountIds = new Set(
        pockets.flatMap((p) => p.accounts.map((acc) => acc.account_id)),
    )

    // Set of parent accounts that have active children
    const parentAccountIds = new Set(
        allAccounts
            .filter((a) => a.parent_account_id && !a.deleted_at)
            .map((a) => a.parent_account_id as string),
    )

    // Candidate accounts: user's active leaf accounts not already assigned to any pocket
    const candidateAccounts = allAccounts.filter(
        (a) =>
            !a.deleted_at &&
            !parentAccountIds.has(a.id) &&
            !assignedAccountIds.has(a.id),
    )

    function openManageModal(pocket: GroupPocketDto) {
        setManagingPocket(pocket)
        setEditName(pocket.name)
        setEditDesc(pocket.description || '')
        setSelectedAccountIdToAssign(candidateAccounts[0]?.id || '')
    }

    async function handleCreatePocket(e: SyntheticEvent<HTMLFormElement>) {
        e.preventDefault()
        const trimmedName = newPocketName.trim()
        if (!trimmedName) return

        try {
            await createPocket.mutateAsync({
                groupId,
                input: {
                    name: trimmedName,
                    description: newPocketDesc.trim() || undefined,
                },
            })
            setNewPocketName('')
            setNewPocketDesc('')
            setCreateModalOpen(false)
            toast.success(`Kantong "${trimmedName}" berhasil dibuat!`)
        } catch {
            toast.error('Gagal membuat kantong grup.')
        }
    }

    async function handleUpdatePocket(e: SyntheticEvent<HTMLFormElement>) {
        e.preventDefault()
        if (!currentPocket) return
        const trimmedName = editName.trim()
        if (!trimmedName) return

        try {
            await updatePocket.mutateAsync({
                groupId,
                pocketId: currentPocket.id,
                input: {
                    name: trimmedName,
                    description: editDesc.trim() || null,
                },
            })
            toast.success('Informasi kantong berhasil diperbarui!')
        } catch {
            toast.error('Gagal memperbarui kantong.')
        }
    }

    async function handleDeletePocket() {
        if (!currentPocket) return

        try {
            await deletePocket.mutateAsync({
                groupId,
                pocketId: currentPocket.id,
            })
            toast.success(`Kantong "${currentPocket.name}" berhasil dihapus.`)
            setManagingPocket(null)
            setDeletingPocketId(null)
        } catch {
            toast.error('Gagal menghapus kantong.')
        }
    }

    async function handleAssignAccount(e: SyntheticEvent<HTMLFormElement>) {
        e.preventDefault()
        if (!currentPocket || !selectedAccountIdToAssign) return

        try {
            await assignAccount.mutateAsync({
                groupId,
                pocketId: currentPocket.id,
                accountId: selectedAccountIdToAssign,
            })
            setSelectedAccountIdToAssign('')
            toast.success('Rekening berhasil ditautkan ke kantong!')
        } catch {
            toast.error('Gagal menautkan rekening ke kantong.')
        }
    }

    async function handleUnassignAccount(accountId: string, accountName: string) {
        if (!currentPocket) return

        try {
            await unassignAccount.mutateAsync({
                groupId,
                pocketId: currentPocket.id,
                accountId,
            })
            toast.success(`Rekening "${accountName}" dilepas dari kantong.`)
        } catch {
            toast.error('Gagal melepas rekening dari kantong.')
        }
    }

    return (
        <div className="space-y-6">
            {/* Header toolbar */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <PiggyBank className="size-5 text-indigo-600 dark:text-indigo-400" />
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                            Kantong Tujuan Grup
                        </h3>
                        <Badge
                            variant="secondary"
                            className="bg-emerald-50 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                        >
                            TRANSPARAN
                        </Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        Wadah bersama untuk alokasi rekening anggota sesuai pos kebutuhan
                    </p>
                </div>

                <Button onClick={() => setCreateModalOpen(true)} className="gap-1.5">
                    <Plus className="size-4" />
                    Buat Kantong Tujuan
                </Button>
            </div>

            {/* Informational banner matching mobile */}
            <div className="flex items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 dark:border-indigo-900/40 dark:bg-indigo-950/20">
                <ShieldAlert className="size-5 shrink-0 text-indigo-600 dark:text-indigo-400" />
                <div className="text-xs text-slate-600 dark:text-slate-300">
                    <p className="font-semibold text-slate-900 dark:text-white">
                        Alokasi Kantong Finansial Bersama
                    </p>
                    <p className="mt-0.5 leading-relaxed">
                        Seluruh saldo akun ditautkan, bukan dipindahkan atau dicadangkan
                        (bukan saldo nol). Semua anggota aktif dapat membuat kantong tujuan.
                    </p>
                </div>
            </div>

            {/* Pockets Content */}
            {(() => {
                if (isLoading) {
                    return (
                        <Card className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
                            Memuat daftar kantong tujuan grup…
                        </Card>
                    )
                }

                if (pockets.length === 0) {
                    return (
                        <Card className="p-10 text-center">
                            <div className="mx-auto mb-3 grid size-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                                <PiggyBank className="size-6" />
                            </div>
                            <h4 className="text-base font-bold text-slate-900 dark:text-white">
                                Belum ada kantong tujuan (bukan saldo nol).
                            </h4>
                            <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
                                Contoh: Belanja Bulanan, Dana Darurat, atau Tabungan Liburan
                                bersama pasangan.
                            </p>
                            <Button
                                className="mt-4 gap-1.5"
                                onClick={() => setCreateModalOpen(true)}
                            >
                                <Plus className="size-4" /> Buat Kantong Pertama
                            </Button>
                        </Card>
                    )
                }

                return (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {pockets.map((pocket) => (
                            <Card
                                key={pocket.id}
                                className="flex flex-col justify-between p-5 transition-all hover:border-slate-300 dark:hover:border-slate-700"
                            >
                                <div>
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-2.5">
                                            <div className="grid size-9 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                                                <PiggyBank className="size-5" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                                    {pocket.name}
                                                </h4>
                                                {pocket.description && (
                                                    <p className="line-clamp-1 text-[11px] text-slate-400">
                                                        {pocket.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <Badge
                                            variant="outline"
                                            className={`text-[10px] ${pocket.accounts.length > 0
                                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300'
                                                    : 'text-slate-400'
                                                }`}
                                        >
                                            {pocket.accounts.length} akun
                                        </Badge>
                                    </div>

                                    <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800">
                                        <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                                            Total Saldo Kantong
                                        </span>
                                        <div className="mt-1">
                                            {pocket.balances.length === 0 ? (
                                                <p className="text-xs font-semibold text-slate-400">
                                                    Belum ada akun tertaut
                                                </p>
                                            ) : (
                                                pocket.balances.map((b) => (
                                                    <p
                                                        key={b.currency}
                                                        className="text-lg font-extrabold text-slate-900 dark:text-white"
                                                    >
                                                        {formatAccountBalance(b.balance, b.currency)}
                                                    </p>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    {/* Linked Account Chips */}
                                    {pocket.accounts.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-1.5">
                                            {pocket.accounts.map((acc) => (
                                                <span
                                                    key={acc.account_id}
                                                    className="inline-flex items-center gap-1 rounded-md border border-slate-200/80 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300"
                                                >
                                                    <Wallet className="size-3 text-slate-400" />
                                                    <span>
                                                        {acc.owner_name.split(' ')[0]}: {acc.name}
                                                    </span>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-5 border-t border-slate-100 pt-3 dark:border-slate-800">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openManageModal(pocket)}
                                        className="w-full justify-center gap-1 text-xs"
                                    >
                                        Kelola & Rincian →
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )
            })()}

            {/* Create Pocket Dialog */}
            <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
                <form onSubmit={(e) => void handleCreatePocket(e)}>
                    <DialogHeader onClose={() => setCreateModalOpen(false)}>
                        <DialogTitle>Buat Kantong Tujuan Baru</DialogTitle>
                        <DialogDescription>
                            Kantong berfungsi mengelompokkan akun-akun kas anggota untuk
                            alokasi pengeluaran tertentu.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-1.5">
                            <label
                                className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                                htmlFor="new-pocket-name"
                            >
                                Nama Kantong <span className="text-rose-500">*</span>
                            </label>
                            <Input
                                id="new-pocket-name"
                                placeholder="Misal: Belanja Dapur, Dana Darurat, Tabungan Liburan"
                                value={newPocketName}
                                onChange={(e) => setNewPocketName(e.target.value)}
                                maxLength={120}
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label
                                className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                                htmlFor="new-pocket-desc"
                            >
                                Deskripsi (Opsional)
                            </label>
                            <Input
                                id="new-pocket-desc"
                                placeholder="Penjelasan tujuan kantong bersama ini"
                                value={newPocketDesc}
                                onChange={(e) => setNewPocketDesc(e.target.value)}
                                maxLength={2000}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setCreateModalOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button type="submit" disabled={createPocket.isPending}>
                            {createPocket.isPending ? 'Menyimpan…' : 'Buat Kantong'}
                        </Button>
                    </DialogFooter>
                </form>
            </Dialog>

            {/* Manage Pocket Details Dialog */}
            {currentPocket && (
                <Dialog
                    open={Boolean(managingPocket)}
                    onOpenChange={(open) => !open && setManagingPocket(null)}
                >
                    <div className="max-h-[85vh] overflow-y-auto p-1">
                        <DialogHeader onClose={() => setManagingPocket(null)}>
                            <DialogTitle className="flex items-center gap-2">
                                <PiggyBank className="size-5 text-indigo-600 dark:text-indigo-400" />
                                <span>Kantong: {currentPocket.name}</span>
                            </DialogTitle>
                            <DialogDescription>
                                Ubah info kantong atau kelola rekening anggota yang tertaut.
                            </DialogDescription>
                        </DialogHeader>

                        {/* Pocket info edit form */}
                        <form
                            onSubmit={(e) => void handleUpdatePocket(e)}
                            className="mt-4 space-y-3 rounded-xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-900/40"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                    Informasi Kantong
                                </span>
                                <Button
                                    type="submit"
                                    size="sm"
                                    variant="outline"
                                    className="h-7 gap-1 text-[11px]"
                                    disabled={updatePocket.isPending}
                                >
                                    <Edit3 className="size-3" />
                                    {updatePocket.isPending ? 'Menyimpan…' : 'Simpan Info'}
                                </Button>
                            </div>

                            <div className="space-y-1">
                                <label
                                    className="text-[11px] font-medium text-slate-500"
                                    htmlFor="edit-pocket-name"
                                >
                                    Nama
                                </label>
                                <Input
                                    id="edit-pocket-name"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    maxLength={120}
                                    required
                                    className="h-8 text-xs"
                                />
                            </div>

                            <div className="space-y-1">
                                <label
                                    className="text-[11px] font-medium text-slate-500"
                                    htmlFor="edit-pocket-desc"
                                >
                                    Deskripsi
                                </label>
                                <Input
                                    id="edit-pocket-desc"
                                    value={editDesc}
                                    onChange={(e) => setEditDesc(e.target.value)}
                                    maxLength={2000}
                                    placeholder="Tidak ada deskripsi"
                                    className="h-8 text-xs"
                                />
                            </div>
                        </form>

                        {/* Linked Accounts List */}
                        <div className="mt-5 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                    Rekening Tertaut ({currentPocket.accounts.length})
                                </span>
                            </div>

                            {currentPocket.accounts.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400 dark:border-slate-800">
                                    Belum ada rekening yang ditautkan ke kantong ini.
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {currentPocket.accounts.map((acc) => (
                                        <div
                                            key={acc.account_id}
                                            className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <div className="grid size-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                                                    <Wallet className="size-4" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                                                        {acc.name}
                                                    </p>
                                                    <span className="text-[10px] text-slate-400">
                                                        Milik: {acc.owner_name}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className="text-right">
                                                    <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                                                        {formatAccountBalance(acc.balance, acc.currency)}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400">
                                                        {acc.currency}
                                                    </span>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        void handleUnassignAccount(acc.account_id, acc.name)
                                                    }
                                                    disabled={unassignAccount.isPending}
                                                    className="h-8 gap-1 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/40"
                                                    title="Lepas dari kantong"
                                                >
                                                    <Unlink className="size-3.5" />
                                                    <span className="sr-only sm:not-sr-only">Lepas</span>
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Assign new candidate account form */}
                        <form
                            onSubmit={(e) => void handleAssignAccount(e)}
                            className="mt-5 space-y-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/40"
                        >
                            <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                                Tautkan Rekening Pribadi Anda
                            </span>

                            {candidateAccounts.length === 0 ? (
                                <p className="text-xs text-slate-400">
                                    Tidak ada rekening pribadi yang memenuhi syarat untuk
                                    ditautkan (semua rekening aktif sudah tertaut atau memiliki
                                    sub-kantong).
                                </p>
                            ) : (
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                    <select
                                        value={selectedAccountIdToAssign}
                                        onChange={(e) =>
                                            setSelectedAccountIdToAssign(e.target.value)
                                        }
                                        className="h-9 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                        required
                                    >
                                        <option value="" disabled>
                                            Pilih rekening pribadi…
                                        </option>
                                        {candidateAccounts.map((acc) => (
                                            <option key={acc.id} value={acc.id}>
                                                {acc.name} (
                                                {formatAccountBalance(acc.balance, acc.currency)})
                                            </option>
                                        ))}
                                    </select>
                                    <Button
                                        type="submit"
                                        size="sm"
                                        disabled={
                                            assignAccount.isPending || !selectedAccountIdToAssign
                                        }
                                        className="gap-1 text-xs"
                                    >
                                        <Plus className="size-3.5" />
                                        {assignAccount.isPending ? 'Menautkan…' : 'Tautkan Akun'}
                                    </Button>
                                </div>
                            )}
                        </form>

                        {/* Delete pocket section */}
                        <div className="mt-6 border-t border-slate-200 pt-4 dark:border-slate-800">
                            {deletingPocketId === currentPocket.id ? (
                                <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-4 dark:border-rose-900/60 dark:bg-rose-950/30">
                                    <p className="text-xs font-semibold text-rose-800 dark:text-rose-200">
                                        Yakin ingin menghapus kantong &quot;{currentPocket.name}
                                        &quot;?
                                    </p>
                                    <p className="mt-0.5 text-[11px] text-rose-600 dark:text-rose-300">
                                        Menghapus kantong akan melepaskan seluruh rekening yang
                                        tertaut. Rekening pribadi dan pembagian dasar grup tetap
                                        aman.
                                    </p>
                                    <div className="mt-3 flex gap-2">
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => void handleDeletePocket()}
                                            disabled={deletePocket.isPending}
                                            className="h-7 text-xs"
                                        >
                                            {deletePocket.isPending
                                                ? 'Menghapus…'
                                                : 'Ya, Hapus Kantong'}
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setDeletingPocketId(null)}
                                            className="h-7 text-xs"
                                        >
                                            Batal
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setDeletingPocketId(currentPocket.id)}
                                    className="gap-1.5 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/30"
                                >
                                    <Trash2 className="size-3.5" />
                                    Hapus Kantong Ini
                                </Button>
                            )}
                        </div>
                    </div>
                </Dialog>
            )}
        </div>
    )
}
