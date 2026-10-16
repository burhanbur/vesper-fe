import { useNavigate } from '@tanstack/react-router'
import {
  ArrowUpDown,
  Banknote,
  Eye,
  EyeOff,
  FolderOpen,
  Landmark,
  LayoutGrid,
  List,
  Plus,
  RotateCcw,
  Scale,
  Search,
  Smartphone,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import {
  AccountCardItem,
  AccountFormDialog,
  AccountsOverviewCards,
  computeAccountsOverview,
  getEffectiveBalance,
  groupAccountsByCategory,
  resolveAccountCategory,
  sortAccountList,
  useAccounts,
  useAccountTypes,
  useDeleteAccount,
  useUpdateAccount,
  type AccountGroupKey,
  type AccountSortOption,
} from '@/features/accounts'
import type { AccountDto } from '@/features/accounts/types/account'
import { formatRupiah } from '@/lib/formatters'

export function AccountsPage() {
  const navigate = useNavigate()
  const [accountModalOpen, setAccountModalOpen] = useState(false)
  const [collapsedParents, setCollapsedParents] = useState<
    Record<string, boolean>
  >({})

  // UX controls state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<
    AccountGroupKey | 'all'
  >('all')
  const [sortOption, setSortOption] =
    useState<AccountSortOption>('balance-desc')
  const [hideZeroBalances, setHideZeroBalances] = useState(false)
  const [viewMode, setViewMode] = useState<'grouped' | 'flat'>('grouped')

  const { data: accounts = [], isLoading } = useAccounts()
  const { data: accountTypes = [] } = useAccountTypes()
  const deleteAccount = useDeleteAccount()
  const updateAccount = useUpdateAccount()

  // Map account types by ID
  const typeMap = useMemo(
    () => new Map(accountTypes.map((t) => [t.id, t])),
    [accountTypes],
  )

  // Separate parent accounts and children map
  const { parentAccounts, childrenMap } = useMemo(() => {
    const parents: AccountDto[] = []
    const children = new Map<string, AccountDto[]>()

    for (const acc of accounts) {
      if (acc.parent_account_id) {
        const list = children.get(acc.parent_account_id) || []
        list.push(acc)
        children.set(acc.parent_account_id, list)
      } else {
        parents.push(acc)
      }
    }

    return { parentAccounts: parents, childrenMap: children }
  }, [accounts])

  // Overview statistics across all accounts
  const overviewStats = useMemo(
    () => computeAccountsOverview(parentAccounts, childrenMap, typeMap),
    [parentAccounts, childrenMap, typeMap],
  )

  // Expand / collapse all kantong
  const allCollapsed = useMemo(() => {
    const parentsWithChildren = parentAccounts.filter(
      (p) => (childrenMap.get(p.id) || []).length > 0,
    )
    if (parentsWithChildren.length === 0) return false
    return parentsWithChildren.every((p) => collapsedParents[p.id])
  }, [parentAccounts, childrenMap, collapsedParents])

  function toggleAllCollapse() {
    const nextCollapsedState = !allCollapsed
    const newState: Record<string, boolean> = {}
    for (const p of parentAccounts) {
      if ((childrenMap.get(p.id) || []).length > 0) {
        newState[p.id] = nextCollapsedState
      }
    }
    setCollapsedParents(newState)
  }

  function toggleCollapse(id: string) {
    setCollapsedParents((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  async function handleToggleVisible(acc: AccountDto) {
    await updateAccount.mutateAsync({
      id: acc.id,
      input: {
        version: acc.version,
        is_visible: !acc.is_visible,
      },
    })
  }

  async function handleDelete(acc: AccountDto) {
    if (window.confirm(`Hapus akun "${acc.name}"?`)) {
      await deleteAccount.mutateAsync({ id: acc.id, version: acc.version })
    }
  }

  // Filter parent accounts based on search, category tab, and zero-balance toggle
  const filteredParents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return parentAccounts.filter((parent) => {
      const parentType = typeMap.get(parent.account_type_id)
      const category = resolveAccountCategory(parent, parentType)
      const children = childrenMap.get(parent.id) || []
      const effBalance = getEffectiveBalance(parent, children)

      // Category tab filter
      if (selectedCategory !== 'all' && category !== selectedCategory) {
        return false
      }

      // Hide zero balance toggle (only when not searching)
      if (hideZeroBalances && !query && effBalance === 0) {
        return false
      }

      // Search query filter (matches parent name/desc, type name, or any pocket name/desc)
      if (query) {
        const matchParent =
          parent.name.toLowerCase().includes(query) ||
          (parent.description || '').toLowerCase().includes(query) ||
          (parentType?.name || '').toLowerCase().includes(query)

        const matchChild = children.some(
          (c) =>
            c.name.toLowerCase().includes(query) ||
            (c.description || '').toLowerCase().includes(query),
        )

        if (!matchParent && !matchChild) {
          return false
        }
      }

      return true
    })
  }, [
    parentAccounts,
    typeMap,
    childrenMap,
    selectedCategory,
    hideZeroBalances,
    searchQuery,
  ])

  // Category counts for the filter tabs
  const categoryCounts = useMemo(() => {
    const counts: Record<AccountGroupKey | 'all', number> = {
      all: parentAccounts.length,
      bank: 0,
      ewallet: 0,
      cash: 0,
      investment: 0,
      liability: 0,
      other: 0,
    }

    for (const p of parentAccounts) {
      const type = typeMap.get(p.account_type_id)
      const cat = resolveAccountCategory(p, type)
      counts[cat] = (counts[cat] || 0) + 1
    }

    return counts
  }, [parentAccounts, typeMap])

  // Grouped data structure for grouped view
  const groupedData = useMemo(() => {
    return groupAccountsByCategory(
      filteredParents,
      typeMap,
      childrenMap,
      sortOption,
    )
  }, [filteredParents, typeMap, childrenMap, sortOption])

  // Sorted flat list for flat view
  const flatSortedParents = useMemo(() => {
    return sortAccountList(filteredParents, sortOption, childrenMap)
  }, [filteredParents, sortOption, childrenMap])

  function resetFilters() {
    setSearchQuery('')
    setSelectedCategory('all')
    setHideZeroBalances(false)
  }

  return (
    <AppShell onLogout={() => void navigate({ to: '/login', replace: true })}>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2.5 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
              <Wallet className="size-7 text-indigo-600 dark:text-indigo-400" />
              Rekening & Akun Keuangan
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Kelola rekening bank, dompet digital, kantong tabungan (nested
              pockets), dan akun investasi.
            </p>
          </div>

          <Button onClick={() => setAccountModalOpen(true)} className="gap-2">
            <Plus className="size-4" />
            Tambah Rekening
          </Button>
        </div>

        {/* Financial Overview Stat Cards */}
        {!isLoading && accounts.length > 0 && (
          <AccountsOverviewCards overview={overviewStats} />
        )}

        {/* Toolbar & Filters */}
        {!isLoading && accounts.length > 0 && (
          <div className="space-y-3">
            {/* Category Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3 dark:border-slate-800/80">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all sm:text-sm ${selectedCategory === 'all'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                  }`}
              >
                Semua
                <span className="rounded-full bg-slate-200 px-1.5 py-0.5 font-mono text-[11px] text-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
                  {categoryCounts.all}
                </span>
              </button>

              {categoryCounts.bank > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedCategory('bank')}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all sm:text-sm ${selectedCategory === 'bank'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-200/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                    }`}
                >
                  🏦 Bank
                  <span className="rounded-full bg-slate-200 px-1.5 py-0.5 font-mono text-[11px] text-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
                    {categoryCounts.bank}
                  </span>
                </button>
              )}

              {categoryCounts.ewallet > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedCategory('ewallet')}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all sm:text-sm ${selectedCategory === 'ewallet'
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-200/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                    }`}
                >
                  💳 E-Wallet
                  <span className="rounded-full bg-slate-200 px-1.5 py-0.5 font-mono text-[11px] text-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
                    {categoryCounts.ewallet}
                  </span>
                </button>
              )}

              {categoryCounts.cash > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedCategory('cash')}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all sm:text-sm ${selectedCategory === 'cash'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-200/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                    }`}
                >
                  💵 Kas & Tunai
                  <span className="rounded-full bg-slate-200 px-1.5 py-0.5 font-mono text-[11px] text-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
                    {categoryCounts.cash}
                  </span>
                </button>
              )}

              {categoryCounts.investment > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedCategory('investment')}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all sm:text-sm ${selectedCategory === 'investment'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-200/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                    }`}
                >
                  📈 Investasi
                  <span className="rounded-full bg-slate-200 px-1.5 py-0.5 font-mono text-[11px] text-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
                    {categoryCounts.investment}
                  </span>
                </button>
              )}

              {categoryCounts.liability > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedCategory('liability')}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all sm:text-sm ${selectedCategory === 'liability'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-200/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                    }`}
                >
                  ⚖️ Hutang
                  <span className="rounded-full bg-slate-200 px-1.5 py-0.5 font-mono text-[11px] text-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
                    {categoryCounts.liability}
                  </span>
                </button>
              )}
            </div>

            {/* Search Bar & Controls Row */}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              {/* Search input */}
              <div className="relative flex-1 sm:max-w-md">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-500" />
                <Input
                  type="text"
                  placeholder="Cari rekening atau kantong..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-8 pl-9"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute top-1/2 right-2.5 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Action buttons & dropdowns */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Sort selector */}
                <div className="flex items-center gap-1.5">
                  <ArrowUpDown className="size-4 text-slate-500" />
                  <Select
                    value={sortOption}
                    onChange={(e) =>
                      setSortOption(e.target.value as AccountSortOption)
                    }
                    className="h-9 w-auto text-xs"
                  >
                    <option value="balance-desc">Saldo Terbesar</option>
                    <option value="balance-asc">Saldo Terkecil</option>
                    <option value="name-asc">Nama (A - Z)</option>
                    <option value="name-desc">Nama (Z - A)</option>
                    <option value="default">Urutan Bawaan</option>
                  </Select>
                </div>

                {/* Hide zero balances toggle */}
                <Button
                  variant={hideZeroBalances ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setHideZeroBalances(!hideZeroBalances)}
                  className="gap-1.5 text-xs"
                  title="Sembunyikan akun dengan saldo Rp 0"
                >
                  {hideZeroBalances ? (
                    <EyeOff className="size-3.5 text-white" />
                  ) : (
                    <Eye className="size-3.5 text-slate-400" />
                  )}
                  <span>Sembunyikan Rp 0</span>
                  {overviewStats.zeroBalanceCount > 0 && (
                    <Badge
                      variant="outline"
                      className={`px-1.5 py-0 text-[10px] ${hideZeroBalances
                          ? 'border-indigo-400/50 bg-indigo-700/50 text-white'
                          : ''
                        }`}
                    >
                      {overviewStats.zeroBalanceCount}
                    </Badge>
                  )}
                </Button>

                {/* Expand / Collapse all sub-accounts */}
                {overviewStats.totalPockets > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleAllCollapse}
                    className="gap-1.5 text-xs"
                    title={
                      allCollapsed
                        ? 'Buka semua kantong sub-akun'
                        : 'Tutup semua kantong sub-akun'
                    }
                  >
                    <FolderOpen className="size-3.5 text-indigo-400" />
                    <span>
                      {allCollapsed ? 'Buka Kantong' : 'Tutup Kantong'}
                    </span>
                  </Button>
                )}

                {/* View Mode Toggle (Grouped vs Flat) */}
                <div className="inline-flex rounded-lg border border-slate-800 bg-slate-900/80 p-0.5">
                  <button
                    type="button"
                    onClick={() => setViewMode('grouped')}
                    className={`rounded-md p-1.5 text-slate-400 transition-colors ${viewMode === 'grouped'
                        ? 'bg-slate-800 text-white shadow-sm'
                        : 'hover:text-slate-200'
                      }`}
                    title="Tampilan Grup Kategori"
                    aria-label="Tampilan Grup Kategori"
                  >
                    <LayoutGrid className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('flat')}
                    className={`rounded-md p-1.5 text-slate-400 transition-colors ${viewMode === 'flat'
                        ? 'bg-slate-800 text-white shadow-sm'
                        : 'hover:text-slate-200'
                      }`}
                    title="Tampilan Daftar Datar"
                    aria-label="Tampilan Daftar Datar"
                  >
                    <List className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content: Account Hierarchy List */}
        {isLoading ? (
          <Card className="p-12 text-center text-sm text-slate-400">
            Memuat daftar rekening…
          </Card>
        ) : accounts.length === 0 ? (
          <Card className="p-12 text-center">
            <Wallet className="mx-auto mb-3 size-12 text-slate-400 dark:text-slate-600" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Belum Ada Rekening
            </h3>
            <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
              Daftarkan akun rekening bank atau kas Anda untuk mulai mencatat
              keuangan.
            </p>
            <Button className="mt-4" onClick={() => setAccountModalOpen(true)}>
              <Plus className="mr-1.5 size-4" /> Tambah Rekening Pertama
            </Button>
          </Card>
        ) : filteredParents.length === 0 ? (
          /* Empty Search / Filter state */
          <Card className="p-10 text-center">
            <Search className="mx-auto mb-3 size-10 text-slate-400 dark:text-slate-600" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Tidak Ada Rekening Ditemukan
            </h3>
            <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
              Tidak ada rekening yang sesuai dengan kata kunci pencarian atau
              filter yang aktif.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 gap-1.5 text-xs"
              onClick={resetFilters}
            >
              <RotateCcw className="size-3.5" />
              Reset Filter & Pencarian
            </Button>
          </Card>
        ) : viewMode === 'grouped' ? (
          /* 1. Grouped by Category View */
          <div className="space-y-6">
            {groupedData.map((group) => {
              const CategoryIcon =
                group.meta.icon === 'bank'
                  ? Landmark
                  : group.meta.icon === 'wallet'
                    ? Smartphone
                    : group.meta.icon === 'cash'
                      ? Banknote
                      : group.meta.icon === 'chart'
                        ? TrendingUp
                        : group.meta.icon === 'scale'
                          ? Scale
                          : Wallet

              return (
                <div
                  key={group.key}
                  className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-sm dark:border-slate-800/80 dark:bg-slate-900/60 dark:shadow-none"
                >
                  {/* Category Group Header Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 bg-slate-50/80 px-4 py-3 sm:px-5 dark:border-slate-800/80 dark:bg-slate-800/40">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                        <CategoryIcon className="size-4" />
                      </div>
                      <h2 className="text-sm font-bold tracking-tight text-slate-900 sm:text-base dark:text-white">
                        {group.meta.name}
                      </h2>
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant="secondary"
                          className="border-slate-200 bg-slate-100 px-2 py-0 text-[10px] text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        >
                          {group.accounts.length} Akun
                        </Badge>
                        {group.totalPockets > 0 && (
                          <Badge
                            variant="outline"
                            className="border-slate-200 px-2 py-0 text-[10px] text-slate-500 dark:border-slate-700/60 dark:text-slate-400"
                          >
                            {group.totalPockets} sub-kantong
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-xs font-semibold text-slate-700 sm:text-sm dark:text-slate-300">
                        Subtotal: {formatRupiah(group.totalBalance)}
                      </span>
                    </div>
                  </div>

                  {/* Account Rows with Hairline Dividers */}
                  <div className="divide-y divide-slate-800/60">
                    {group.accounts.map((parent) => (
                      <AccountCardItem
                        key={parent.id}
                        parent={parent}
                        childrenList={childrenMap.get(parent.id) || []}
                        isCollapsed={collapsedParents[parent.id] ?? false}
                        onToggleCollapse={toggleCollapse}
                        typeMap={typeMap}
                        onNavigateDetail={(id) =>
                          void navigate({
                            to: '/accounts/$accountId',
                            params: { accountId: id },
                          })
                        }
                        onToggleVisible={(target) => {
                          void handleToggleVisible(target)
                        }}
                        onDelete={(target) => {
                          void handleDelete(target)
                        }}
                        category={group.key}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* 2. Flat Sorted List View */
          <div className="divide-y divide-slate-800/60 overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 shadow-sm backdrop-blur-sm">
            {flatSortedParents.map((parent) => (
              <AccountCardItem
                key={parent.id}
                parent={parent}
                childrenList={childrenMap.get(parent.id) || []}
                isCollapsed={collapsedParents[parent.id] ?? false}
                onToggleCollapse={toggleCollapse}
                typeMap={typeMap}
                onNavigateDetail={(id) =>
                  void navigate({
                    to: '/accounts/$accountId',
                    params: { accountId: id },
                  })
                }
                onToggleVisible={(target) => {
                  void handleToggleVisible(target)
                }}
                onDelete={(target) => {
                  void handleDelete(target)
                }}
              />
            ))}
          </div>
        )}

        {/* Hidden Zero Balance Footer Notification */}
        {hideZeroBalances && overviewStats.zeroBalanceCount > 0 && (
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-3 text-center text-xs text-slate-400">
            <span>
              {overviewStats.zeroBalanceCount} akun dengan saldo Rp 0
              disembunyikan.{' '}
            </span>
            <button
              type="button"
              onClick={() => setHideZeroBalances(false)}
              className="font-semibold text-indigo-400 hover:underline"
            >
              Tampilkan Semua
            </button>
          </div>
        )}
      </div>

      <AccountFormDialog
        open={accountModalOpen}
        onOpenChange={setAccountModalOpen}
      />
    </AppShell>
  )
}
