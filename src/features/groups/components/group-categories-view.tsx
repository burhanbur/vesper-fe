import {
    Layers,
    Link,
    Plus,
    Trash2,
    Unlink,
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
import { Progress } from '@/components/ui/progress'
import { useCategories } from '@/features/categories'
import {
    useCreateGroupCategory,
    useDeleteGroupCategory,
    useGroupCategories,
    useGroupCategoryMappings,
    useGroupReport,
    useMapCategory,
    useUnmapCategory,
} from '../hooks/use-groups'
import type { GroupCategoryDto } from '../types/group'
import { formatRupiah } from '@/lib/formatters'

interface GroupCategoriesViewProps {
    readonly groupId: string
    readonly period: string
}

export function GroupCategoriesView({
    groupId,
    period,
}: GroupCategoriesViewProps) {
    const [createCategoryModalOpen, setCreateCategoryModalOpen] = useState(false)
    const [mapCategoryModalOpen, setMapCategoryModalOpen] = useState(false)
    const [newCatName, setNewCatName] = useState('')
    const [newCatType, setNewCatType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE')

    const [selectedUserCatId, setSelectedUserCatId] = useState('')
    const [selectedGroupCatId, setSelectedGroupCatId] = useState('')

    const [deletingCat, setDeletingCat] = useState<GroupCategoryDto | null>(null)

    const { data: groupCategories = [], isLoading: isCatLoading } =
        useGroupCategories(groupId)
    const { data: mappings = [] } = useGroupCategoryMappings(groupId)
    const { data: personalCategories = [] } = useCategories()
    const { data: report, isLoading: isReportLoading } = useGroupReport(
        groupId,
        period,
    )

    const createGroupCategory = useCreateGroupCategory()
    const deleteGroupCategory = useDeleteGroupCategory()
    const mapCategory = useMapCategory()
    const unmapCategory = useUnmapCategory()

    const personalCatMap = new Map(personalCategories.map((c) => [c.id, c]))
    const groupCatMap = new Map(groupCategories.map((c) => [c.id, c]))

    // Active mappings lookup
    const mappedUserCatIds = new Set(mappings.map((m) => m.user_category_id))

    // Available personal categories for mapping
    const availablePersonalCats = personalCategories.filter(
        (c) => !mappedUserCatIds.has(c.id) && !c.deleted_at,
    )

    async function handleCreateGroupCategory(
        e: SyntheticEvent<HTMLFormElement>,
    ) {
        e.preventDefault()
        if (!newCatName.trim()) return

        try {
            await createGroupCategory.mutateAsync({
                groupId,
                input: { name: newCatName.trim(), type: newCatType },
            })
            setNewCatName('')
            setCreateCategoryModalOpen(false)
            toast.success('Kategori grup berhasil ditambahkan!')
        } catch {
            toast.error('Gagal menambahkan kategori grup.')
        }
    }

    async function handleMapCategory(e: SyntheticEvent<HTMLFormElement>) {
        e.preventDefault()
        if (!selectedUserCatId || !selectedGroupCatId) return

        try {
            await mapCategory.mutateAsync({
                groupId,
                groupCategoryId: selectedGroupCatId,
                userCategoryId: selectedUserCatId,
            })
            setSelectedUserCatId('')
            setSelectedGroupCatId('')
            setMapCategoryModalOpen(false)
            toast.success('Kategori pribadi berhasil dipetakan ke kategori grup!')
        } catch {
            toast.error('Gagal memetakan kategori.')
        }
    }

    async function handleUnmap(groupCatId: string, userCatId: string) {
        try {
            await unmapCategory.mutateAsync({
                groupId,
                groupCategoryId: groupCatId,
                userCategoryId: userCatId,
            })
            toast.success('Pemetaan kategori dicabut.')
        } catch {
            toast.error('Gagal mencabut pemetaan kategori.')
        }
    }

    async function handleConfirmDelete() {
        if (!deletingCat) return

        try {
            await deleteGroupCategory.mutateAsync({
                groupId,
                groupCategoryId: deletingCat.id,
            })
            toast.success(`Kategori "${deletingCat.name}" berhasil dihapus.`)
            setDeletingCat(null)
        } catch {
            toast.error('Gagal menghapus kategori grup.')
        }
    }

    // Calculate report totals
    const totalExpenseReport = (report?.categories || [])
        .filter((c) => c.type === 'EXPENSE')
        .reduce((acc, c) => acc + (Number.parseFloat(c.expense) || 0), 0)

    return (
        <div className="space-y-6">
            {/* Category Spending Report for the Period */}
            <Card className="p-6">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            Laporan Pengeluaran Kategori Bersama ({period})
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Rincian alokasi pengeluaran grup berdasarkan kategori bersama yang
                            telah dipetakan.
                        </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                        Total {formatRupiah(totalExpenseReport)}
                    </Badge>
                </div>

                {(() => {
                    if (isReportLoading) {
                        return (
                            <div className="py-8 text-center text-xs text-slate-500">
                                Memuat laporan kategori…
                            </div>
                        )
                    }
                    if (!report?.categories || report.categories.length === 0) {
                        return (
                            <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
                                Belum ada transaksi yang dipetakan pada kategori bersama di bulan{' '}
                                {period}.
                            </div>
                        )
                    }
                    return (
                        <div className="mt-4 space-y-4">
                            {report.categories.map((c) => {
                                const exp = Number.parseFloat(c.expense) || 0
                                const percentage =
                                    totalExpenseReport > 0
                                        ? Math.round((exp / totalExpenseReport) * 100)
                                        : 0

                                return (
                                    <div key={c.group_category_id} className="space-y-1.5">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                                                {c.name}
                                            </span>
                                            <span className="font-bold text-rose-600 dark:text-rose-400">
                                                {formatRupiah(exp)} ({percentage}%)
                                            </span>
                                        </div>
                                        <Progress
                                            value={percentage}
                                            max={100}
                                            className="h-2"
                                            indicatorClassName="bg-indigo-600"
                                        />
                                    </div>
                                )
                            })}
                        </div>
                    )
                })()}
            </Card>

            {/* Group Categories & Mappings Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Left: Defined Group Categories */}
                <Card className="p-6">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <Layers className="size-5 text-indigo-600 dark:text-indigo-400" />
                            <div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                    Kategori Grup
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Kategori standar untuk grup ini
                                </p>
                            </div>
                        </div>
                        <Button
                            size="sm"
                            onClick={() => setCreateCategoryModalOpen(true)}
                            className="gap-1.5 text-xs"
                        >
                            <Plus className="size-3.5" /> Tambah
                        </Button>
                    </div>

                    {(() => {
                        if (isCatLoading) {
                            return (
                                <div className="py-8 text-center text-xs text-slate-500">
                                    Memuat kategori grup…
                                </div>
                            )
                        }
                        if (groupCategories.length === 0) {
                            return (
                                <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
                                    Belum ada kategori grup. Buat kategori seperti "Belanja Dapur" atau
                                    "Tagihan".
                                </div>
                            )
                        }
                        return (
                            <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800/80">
                                {groupCategories.map((gc) => (
                                    <div
                                        key={gc.id}
                                        className="flex items-center justify-between py-3 first:pt-1 last:pb-1"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                                {gc.name}
                                            </span>
                                            <Badge
                                                variant={
                                                    gc.type === 'EXPENSE' ? 'destructive' : 'default'
                                                }
                                                className="text-[10px]"
                                            >
                                                {gc.type === 'EXPENSE' ? 'Pengeluaran' : 'Pemasukan'}
                                            </Badge>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setDeletingCat(gc)}
                                            className="size-8 p-0 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                                        >
                                            <Trash2 className="size-3.5" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )
                    })()}
                </Card>

                {/* Right: Personal to Group Category Mappings */}
                <Card className="p-6">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <Link className="size-5 text-indigo-600 dark:text-indigo-400" />
                            <div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                    Pemetaan Kategori Anda
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Hubungkan kategori pribadi ke kategori grup
                                </p>
                            </div>
                        </div>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                                setSelectedUserCatId(availablePersonalCats[0]?.id || '')
                                setSelectedGroupCatId(groupCategories[0]?.id || '')
                                setMapCategoryModalOpen(true)
                            }}
                            disabled={
                                availablePersonalCats.length === 0 ||
                                groupCategories.length === 0
                            }
                            className="gap-1.5 text-xs"
                        >
                            <Plus className="size-3.5" /> Petakan
                        </Button>
                    </div>

                    {mappings.length === 0 ? (
                        <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
                            Belum ada kategori pribadi yang dipetakan ke grup ini.
                        </div>
                    ) : (
                        <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800/80">
                            {mappings.map((m) => {
                                const userCat = personalCatMap.get(m.user_category_id)
                                const groupCat = groupCatMap.get(m.group_category_id)

                                return (
                                    <div
                                        key={m.id}
                                        className="flex items-center justify-between py-3 first:pt-1 last:pb-1"
                                    >
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className="font-semibold text-slate-900 dark:text-white">
                                                {userCat?.name || 'Kategori Pribadi'}
                                            </span>
                                            <span className="text-slate-400">➔</span>
                                            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                                                {groupCat?.name || 'Kategori Grup'}
                                            </span>
                                        </div>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                void handleUnmap(
                                                    m.group_category_id,
                                                    m.user_category_id,
                                                )
                                            }
                                            className="size-8 p-0 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                                            title="Cabut Pemetaan"
                                        >
                                            <Unlink className="size-3.5" />
                                        </Button>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </Card>
            </div>

            {/* Create Group Category Dialog */}
            <Dialog
                open={createCategoryModalOpen}
                onOpenChange={setCreateCategoryModalOpen}
            >
                <form onSubmit={(e) => void handleCreateGroupCategory(e)}>
                    <DialogHeader onClose={() => setCreateCategoryModalOpen(false)}>
                        <DialogTitle>Tambah Kategori Grup Baru</DialogTitle>
                        <DialogDescription>
                            Kategori bersama membantu menyelaraskan laporan pengeluaran antar
                            anggota keluarga.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label
                                className="text-xs font-medium text-slate-700 dark:text-slate-300"
                                htmlFor="grp-cat-name"
                            >
                                Nama Kategori
                            </label>
                            <Input
                                id="grp-cat-name"
                                placeholder="Contoh: Belanja Dapur, Kebutuhan Anak, Tagihan"
                                value={newCatName}
                                onChange={(e) => setNewCatName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label
                                className="text-xs font-medium text-slate-700 dark:text-slate-300"
                                htmlFor="grp-cat-type"
                            >
                                Tipe Kategori
                            </label>
                            <select
                                id="grp-cat-type"
                                value={newCatType}
                                onChange={(e) =>
                                    setNewCatType(e.target.value as 'EXPENSE' | 'INCOME')
                                }
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                            >
                                <option value="EXPENSE">Pengeluaran Bersama (Expense)</option>
                                <option value="INCOME">Pemasukan Bersama (Income)</option>
                            </select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setCreateCategoryModalOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button type="submit" disabled={createGroupCategory.isPending}>
                            {createGroupCategory.isPending ? 'Menyimpan…' : 'Simpan Kategori'}
                        </Button>
                    </DialogFooter>
                </form>
            </Dialog>

            {/* Map Category Dialog */}
            <Dialog
                open={mapCategoryModalOpen}
                onOpenChange={setMapCategoryModalOpen}
            >
                <form onSubmit={(e) => void handleMapCategory(e)}>
                    <DialogHeader onClose={() => setMapCategoryModalOpen(false)}>
                        <DialogTitle>Petakan Kategori Pribadi ke Grup</DialogTitle>
                        <DialogDescription>
                            Transaksi pada rekening bersama yang menggunakan kategori pribadi
                            ini akan dikelompokkan ke dalam kategori grup di laporan.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label
                                className="text-xs font-medium text-slate-700 dark:text-slate-300"
                                htmlFor="user-cat-select"
                            >
                                Kategori Pribadi Anda
                            </label>
                            <select
                                id="user-cat-select"
                                value={selectedUserCatId}
                                onChange={(e) => setSelectedUserCatId(e.target.value)}
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                required
                            >
                                {availablePersonalCats.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} ({c.type})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label
                                className="text-xs font-medium text-slate-700 dark:text-slate-300"
                                htmlFor="group-cat-select"
                            >
                                Petakan ke Kategori Grup
                            </label>
                            <select
                                id="group-cat-select"
                                value={selectedGroupCatId}
                                onChange={(e) => setSelectedGroupCatId(e.target.value)}
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                required
                            >
                                {groupCategories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} ({c.type})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setMapCategoryModalOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button type="submit" disabled={mapCategory.isPending}>
                            {mapCategory.isPending ? 'Memetakan…' : 'Hubungkan'}
                        </Button>
                    </DialogFooter>
                </form>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={Boolean(deletingCat)}
                onOpenChange={(open) => !open && setDeletingCat(null)}
            >
                <DialogHeader onClose={() => setDeletingCat(null)}>
                    <DialogTitle>Hapus Kategori Grup?</DialogTitle>
                    <DialogDescription>
                        Apakah Anda yakin ingin menghapus kategori{' '}
                        <strong>{deletingCat?.name}</strong>? Pemetaan kategori pribadi yang
                        terhubung akan terputus.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="mt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setDeletingCat(null)}
                    >
                        Batal
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={() => void handleConfirmDelete()}
                        disabled={deleteGroupCategory.isPending}
                    >
                        {deleteGroupCategory.isPending ? 'Menghapus…' : 'Hapus Kategori'}
                    </Button>
                </DialogFooter>
            </Dialog>
        </div>
    )
}
