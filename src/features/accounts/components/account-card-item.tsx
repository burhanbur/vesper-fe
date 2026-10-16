import {
    ChevronDown,
    ChevronRight,
    Eye,
    EyeOff,
    Info,
    Layers,
    Trash2,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AccountTotalToggle } from './account-total-toggle'
import type { AccountDto, AccountTypeDto } from '../types/account'
import {
    getEffectiveBalance,
    type AccountGroupKey,
} from '../utils/account-grouping'
import { getAccountVisual } from '../utils/account-visuals'
import { formatRupiah } from '@/lib/formatters'

interface AccountCardItemProps {
    readonly parent: AccountDto
    readonly childrenList: AccountDto[]
    readonly isCollapsed: boolean
    readonly onToggleCollapse: (id: string) => void
    readonly typeMap: Map<string, AccountTypeDto>
    readonly onNavigateDetail: (id: string) => void
    readonly onToggleVisible: (account: AccountDto) => void
    readonly onDelete: (account: AccountDto) => void
    readonly category?: AccountGroupKey
}

export function AccountCardItem({
    parent,
    childrenList,
    isCollapsed,
    onToggleCollapse,
    typeMap,
    onNavigateDetail,
    onToggleVisible,
    onDelete,
}: AccountCardItemProps) {
    const hasChildren = childrenList.length > 0
    const parentType = typeMap.get(parent.account_type_id)
    const totalBalance = getEffectiveBalance(parent, childrenList)
    const isZeroBalance = totalBalance === 0
    const visual = getAccountVisual(parent, parentType)
    const VisualIcon = visual.icon

    return (
        <div className="group/item transition-colors">
            {/* Parent Account Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 px-4 transition-colors hover:bg-slate-50 sm:p-4 sm:px-5 dark:hover:bg-slate-800/35">
                {/* Left info column */}
                <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-3.5">
                    {hasChildren ? (
                        <button
                            type="button"
                            onClick={() => onToggleCollapse(parent.id)}
                            className="flex size-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                            aria-label="Toggle Sub-accounts"
                        >
                            {isCollapsed ? (
                                <ChevronRight className="size-4" />
                            ) : (
                                <ChevronDown className="size-4" />
                            )}
                        </button>
                    ) : (
                        <div className="hidden w-7 shrink-0 sm:block" />
                    )}

                    {/* Intelligent Visual Badge (Replaces pink emoji purse) */}
                    <div
                        className={`flex size-10 shrink-0 items-center justify-center rounded-xl border ${visual.badgeBorder} ${visual.badgeBg} ${visual.badgeText} shadow-sm transition-transform duration-150 group-hover/item:scale-105`}
                    >
                        <VisualIcon className="size-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate text-sm font-semibold tracking-tight text-slate-900 sm:text-base dark:text-white">
                                {parent.name}
                            </h3>
                            {hasChildren ? (
                                <Badge
                                    variant="secondary"
                                    className="border-slate-200 bg-slate-100 px-2 py-0 text-[10px] text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                >
                                    {childrenList.length} Kantong
                                </Badge>
                            ) : null}
                            {parentType ? (
                                <Badge
                                    variant={
                                        parentType.category === 'INVESTMENT' ? 'default' : 'outline'
                                    }
                                    className="px-2 py-0 text-[10px]"
                                >
                                    {parentType.name}
                                </Badge>
                            ) : null}
                            {!parent.is_visible && (
                                <Badge variant="destructive" className="px-2 py-0 text-[10px]">
                                    Disembunyikan
                                </Badge>
                            )}
                        </div>
                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                            {parent.description || parentType?.name || 'Akun Utama'}
                        </p>
                    </div>
                </div>

                {/* Right numbers & actions column */}
                <div className="flex shrink-0 items-center gap-3 sm:gap-4">
                    <div className="text-right">
                        <p
                            className={`font-mono text-sm font-bold tracking-tight sm:text-base ${isZeroBalance
                                    ? 'text-slate-400 dark:text-slate-500'
                                    : totalBalance < 0
                                        ? 'text-rose-600 dark:text-rose-400'
                                        : 'text-slate-900 dark:text-white'
                                }`}
                        >
                            {formatRupiah(totalBalance)}
                        </p>
                        {hasChildren ? (
                            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                                Total Gabungan ({childrenList.length} Kantong)
                            </p>
                        ) : null}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1">
                        <AccountTotalToggle account={parent} />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 rounded-lg text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400"
                            onClick={() => onNavigateDetail(parent.id)}
                            aria-label={`Lihat detail akun ${parent.name}`}
                        >
                            <Info className="size-4" aria-hidden="true" />
                        </Button>
                        <button
                            type="button"
                            onClick={() => onToggleVisible(parent)}
                            className={`flex size-8 items-center justify-center rounded-lg transition-colors ${parent.is_visible
                                    ? 'text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                                    : 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 dark:text-amber-400'
                                }`}
                            title={parent.is_visible ? 'Sembunyikan' : 'Tampilkan'}
                        >
                            {parent.is_visible ? (
                                <Eye className="size-4" />
                            ) : (
                                <EyeOff className="size-4" />
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => onDelete(parent)}
                            className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
                            title="Hapus Akun"
                        >
                            <Trash2 className="size-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Nested Children Pockets (Expandable) */}
            {hasChildren && !isCollapsed ? (
                <div className="divide-y divide-slate-200/60 border-t border-slate-200/80 bg-slate-50/60 py-1 pr-3 pl-6 sm:pr-5 sm:pl-14 dark:divide-slate-800/40 dark:border-slate-800/60 dark:bg-slate-950/40">
                    {childrenList.map((child) => (
                        <div
                            key={child.id}
                            className="flex flex-wrap items-center justify-between gap-3 rounded-lg p-2.5 px-3 transition-colors hover:bg-slate-100/70 dark:hover:bg-slate-800/25"
                        >
                            <div className="flex min-w-0 items-center gap-2.5">
                                <Layers className="size-3.5 shrink-0 text-indigo-500/80 dark:text-indigo-400/80" />
                                <div className="min-w-0">
                                    <p className="truncate text-xs font-medium text-slate-800 sm:text-sm dark:text-slate-200">
                                        {child.name}
                                    </p>
                                    {child.description ? (
                                        <p className="truncate text-[11px] text-slate-500">
                                            {child.description}
                                        </p>
                                    ) : null}
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="font-mono text-xs font-semibold text-slate-800 sm:text-sm dark:text-slate-200">
                                    {formatRupiah(child.balance)}
                                </span>
                                <AccountTotalToggle account={child} />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-7 rounded-lg text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400"
                                    onClick={() => onNavigateDetail(child.id)}
                                    aria-label={`Lihat detail akun ${child.name}`}
                                >
                                    <Info className="size-3.5" aria-hidden="true" />
                                </Button>
                                <button
                                    type="button"
                                    onClick={() => onDelete(child)}
                                    className="flex size-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
                                    title="Hapus Kantong"
                                >
                                    <Trash2 className="size-3.5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : null}
        </div>
    )
}
