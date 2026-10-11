import { useNavigate } from '@tanstack/react-router'
import {
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  FolderTree,
  Plus,
  Trash2,
  Wallet,
} from 'lucide-react'
import { useState } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AccountFormDialog } from '@/features/accounts/components/account-form-dialog'
import {
  useAccounts,
  useAccountTypes,
  useDeleteAccount,
  useUpdateAccount,
} from '@/features/accounts'
import type { AccountDto } from '@/features/accounts/types/account'
import { formatRupiah } from '@/lib/formatters'

export function AccountsPage() {
  const navigate = useNavigate()
  const [accountModalOpen, setAccountModalOpen] = useState(false)
  const [collapsedParents, setCollapsedParents] = useState<
    Record<string, boolean>
  >({})

  const { data: accounts = [], isLoading } = useAccounts()
  const { data: accountTypes = [] } = useAccountTypes()
  const deleteAccount = useDeleteAccount()
  const updateAccount = useUpdateAccount()

  // Map account type names
  const typeMap = new Map(accountTypes.map((t) => [t.id, t]))

  // Separate parent accounts and direct accounts
  const parentAccounts = accounts.filter((a) => !a.parent_account_id)
  const childrenMap = new Map<string, AccountDto[]>()

  accounts.forEach((acc) => {
    if (acc.parent_account_id) {
      const list = childrenMap.get(acc.parent_account_id) || []
      list.push(acc)
      childrenMap.set(acc.parent_account_id, list)
    }
  })

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

  return (
    <AppShell onLogout={() => void navigate({ to: '/login', replace: true })}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2.5 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              <Wallet className="size-7 text-indigo-400" />
              Rekening & Akun Keuangan
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Kelola rekening bank, dompet digital, kantong tabungan (nested
              pockets), dan akun investasi.
            </p>
          </div>

          <Button onClick={() => setAccountModalOpen(true)} className="gap-2">
            <Plus className="size-4" />
            Tambah Rekening
          </Button>
        </div>

        {/* Account Hierarchy List */}
        {isLoading ? (
          <Card className="p-12 text-center text-sm text-slate-400">
            Memuat daftar rekening…
          </Card>
        ) : accounts.length === 0 ? (
          <Card className="p-12 text-center">
            <Wallet className="mx-auto mb-3 size-12 text-slate-600" />
            <h3 className="text-base font-bold text-white">
              Belum Ada Rekening
            </h3>
            <p className="mx-auto mt-1 max-w-sm text-xs text-slate-400">
              Daftarkan akun rekening bank atau kas Anda untuk mulai mencatat
              keuangan.
            </p>
            <Button className="mt-4" onClick={() => setAccountModalOpen(true)}>
              <Plus className="mr-1.5 size-4" /> Tambah Rekening Pertama
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {parentAccounts.map((parent) => {
              const children = childrenMap.get(parent.id) || []
              const hasChildren = children.length > 0
              const isCollapsed = collapsedParents[parent.id] ?? false
              const parentType = typeMap.get(parent.account_type_id)

              // If account has children, calculate aggregated balance
              const totalBalance = hasChildren
                ? children.reduce(
                    (sum, c) => sum + parseFloat(c.balance || '0'),
                    0,
                  )
                : parseFloat(parent.balance || '0')

              return (
                <Card
                  key={parent.id}
                  className="overflow-hidden border-slate-800/90"
                >
                  {/* Parent Account Header */}
                  <div className="hover:bg-slate-850/80 flex items-center justify-between bg-slate-900/90 p-4 transition-colors sm:p-5">
                    <div className="flex min-w-0 items-center gap-3.5">
                      {hasChildren ? (
                        <button
                          type="button"
                          onClick={() => toggleCollapse(parent.id)}
                          className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                          aria-label="Toggle Sub-accounts"
                        >
                          {isCollapsed ? (
                            <ChevronRight className="size-4" />
                          ) : (
                            <ChevronDown className="size-4" />
                          )}
                        </button>
                      ) : (
                        <span className="w-6" />
                      )}

                      <span className="text-2xl">
                        {parent.icon === 'bank'
                          ? '🏦'
                          : parent.icon === 'wallet'
                            ? '💳'
                            : parent.icon === 'cash'
                              ? '💵'
                              : parent.icon === 'chart'
                                ? '📈'
                                : '👛'}
                      </span>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate text-base font-bold text-white">
                            {parent.name}
                          </h3>
                          {hasChildren ? (
                            <Badge variant="secondary" className="text-[10px]">
                              {children.length} Kantong
                            </Badge>
                          ) : null}
                          {parentType ? (
                            <Badge
                              variant={
                                parentType.category === 'INVESTMENT'
                                  ? 'default'
                                  : 'outline'
                              }
                              className="text-[10px]"
                            >
                              {parentType.name}
                            </Badge>
                          ) : null}
                        </div>
                        <p className="truncate text-xs text-slate-400">
                          {parent.description || 'Akun Utama'}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-4">
                      <div className="text-right">
                        <p className="font-mono text-base font-bold tracking-tight text-white sm:text-lg">
                          {formatRupiah(totalBalance)}
                        </p>
                        {hasChildren ? (
                          <p className="text-[10px] text-slate-400">
                            Total Gabungan
                          </p>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => void handleToggleVisible(parent)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                          title={
                            parent.is_visible ? 'Sembunyikan' : 'Tampilkan'
                          }
                        >
                          {parent.is_visible ? (
                            <Eye className="size-4" />
                          ) : (
                            <EyeOff className="size-4 text-slate-600" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(parent)}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-800 hover:text-rose-400"
                          title="Hapus Akun"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Nested Children Pockets (Expandable) */}
                  {hasChildren && !isCollapsed ? (
                    <div className="divide-slate-850/60 divide-y border-t border-slate-800/80 bg-slate-950/40 pl-6 sm:pl-10">
                      {children.map((child) => (
                        <div
                          key={child.id}
                          className="flex items-center justify-between p-3.5 pr-4 transition-colors hover:bg-slate-800/25"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <FolderTree className="size-4 shrink-0 text-indigo-400" />
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-slate-200">
                                {child.name}
                              </p>
                              {child.description ? (
                                <p className="truncate text-[11px] text-slate-500">
                                  {child.description}
                                </p>
                              ) : null}
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-3">
                            <span className="font-mono text-sm font-semibold text-slate-100">
                              {formatRupiah(child.balance)}
                            </span>
                            <button
                              type="button"
                              onClick={() => void handleDelete(child)}
                              className="rounded-lg p-1 text-slate-500 hover:text-rose-400"
                              title="Hapus Kantong"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </Card>
              )
            })}
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
