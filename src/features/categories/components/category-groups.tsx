import { Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { CategoryDto, CategoryType } from '../types/category'

type CategoryGroupsProps = {
    categories: CategoryDto[]
    onDelete: (id: string, version: string) => void
}

const GROUPS: { type: CategoryType; label: string }[] = [
    { type: 'INCOME', label: 'Pemasukan' },
    { type: 'EXPENSE', label: 'Pengeluaran' },
]

export function CategoryGroups({ categories, onDelete }: CategoryGroupsProps) {
    return (
        <div className="space-y-6">
            {GROUPS.map(({ type, label }) => {
                const sortedCategories = categories
                    .filter((category) => category.type === type)
                    .sort(
                        (left, right) =>
                            left.name.localeCompare(right.name, 'id-ID', {
                                sensitivity: 'base',
                                numeric: true,
                            }) || left.id.localeCompare(right.id),
                    )
                return (
                    <section
                        key={type}
                        aria-labelledby={`category-group-${type}`}
                        className="space-y-3"
                    >
                        <div className="flex items-center gap-2">
                            <h4
                                id={`category-group-${type}`}
                                className="text-sm font-semibold text-slate-900 dark:text-slate-100"
                            >
                                {label}
                            </h4>
                            <Badge variant={type === 'INCOME' ? 'success' : 'destructive'}>
                                {sortedCategories.length} kategori
                            </Badge>
                        </div>
                        {sortedCategories.length === 0 ? (
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Belum ada kategori {label.toLowerCase()}.
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                                {sortedCategories.map((category) => (
                                    <div
                                        key={category.id}
                                        className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900/60"
                                    >
                                        <div className="flex min-w-0 items-center gap-2.5">
                                            <span aria-hidden="true" className="text-lg">
                                                {type === 'INCOME' ? '💰' : '💸'}
                                            </span>
                                            <p className="min-w-0 text-sm font-semibold break-words text-slate-800 dark:text-slate-100">
                                                {category.name}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => onDelete(category.id, category.version)}
                                            aria-label={`Hapus kategori ${label.toLowerCase()} ${category.name}`}
                                            className="focus-visible:ring-ring shrink-0 rounded p-1 text-slate-400 hover:text-rose-500 focus-visible:ring-2 focus-visible:outline-none dark:text-slate-500 dark:hover:text-rose-400"
                                        >
                                            <Trash2 aria-hidden="true" className="size-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )
            })}
        </div>
    )
}
