import { Link, useRouterState } from '@tanstack/react-router'
import {
  ArrowRightLeft,
  CheckCircle2,
  FolderKanban,
  FolderSync,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  ReceiptText,
  Settings,
  TrendingUp,
  Users,
  Wallet,
  X,
} from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { ThemeToggle } from '@/components/common/theme-toggle'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth'
import { NotificationDropdown } from '@/features/notifications'
import { TransactionFormDialog } from '@/features/transactions/components/transaction-form-dialog'
import { TransferFormDialog } from '@/features/transactions/components/transfer-form-dialog'

interface AppShellProps {
  readonly children: ReactNode
  readonly onLogout: () => void
}

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/accounts', label: 'Rekening & Akun', icon: Wallet },
  { to: '/transactions', label: 'Transaksi', icon: ReceiptText },
  { to: '/budgets', label: 'Anggaran (Budget)', icon: FolderKanban },
  { to: '/investments', label: 'Investasi & Portofolio', icon: TrendingUp },
  { to: '/groups', label: 'Grup Keuangan', icon: Users },
  { to: '/import', label: 'Impor Money Manager', icon: FolderSync },
  { to: '/settings', label: 'Pengaturan', icon: Settings },
]

export function AppShell({ children, onLogout }: AppShellProps) {
  const { user, logout } = useAuth()
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [quickTxOpen, setQuickTxOpen] = useState(false)
  const [quickTransferOpen, setQuickTransferOpen] = useState(false)

  async function handleLogout() {
    await logout()
    onLogout()
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 transition-colors duration-200 md:flex-row dark:bg-[#090D16] dark:text-slate-100">
      {/* Desktop Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col justify-between border-r border-slate-200/80 bg-white/90 p-5 backdrop-blur-xl md:flex dark:border-slate-800/80 dark:bg-[#0D111D]/90">
        <div className="space-y-6">
          {/* Brand */}
          <div className="flex items-center gap-3 px-2">
            <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-500 text-white shadow-lg shadow-indigo-500/25">
              <Layers className="size-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                  VESPER
                </span>
                <span className="rounded border border-indigo-500/30 bg-indigo-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Wealth & Daily Finance
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="space-y-2 pt-2">
            <Button
              className="w-full justify-start gap-2 text-xs shadow-md shadow-indigo-600/20"
              onClick={() => setQuickTxOpen(true)}
            >
              <Plus className="size-4" />
              Catat Transaksi
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2 border-slate-200 text-xs text-slate-700 hover:bg-slate-100 dark:border-slate-700/80 dark:text-slate-300 dark:hover:bg-slate-800"
              onClick={() => setQuickTransferOpen(true)}
            >
              <ArrowRightLeft className="size-3.5 text-indigo-500 dark:text-indigo-400" />
              Transfer Dana
            </Button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <p className="mb-2 px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase dark:text-slate-500">
              Menu Utama
            </p>
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
              const isActive = currentPath === to
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${isActive
                      ? 'border border-indigo-500/30 bg-indigo-50 font-semibold text-indigo-600 shadow-xs dark:bg-indigo-600/15 dark:text-indigo-400'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200'
                    }`}
                >
                  <Icon
                    className={`size-4 shrink-0 ${isActive
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-500 dark:text-slate-400'
                      }`}
                  />
                  <span>{label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Sidebar Footer / User Profile */}
        <div className="space-y-3 border-t border-slate-200/80 pt-4 dark:border-slate-800/80">
          <div className="flex items-center gap-3 px-2">
            <div className="grid size-9 place-items-center rounded-xl border border-slate-200 bg-slate-100 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
              {user?.name?.slice(0, 2).toUpperCase() || 'BM'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-200">
                {user?.name || 'Burhan Mafazi'}
              </p>
              <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                {user?.email || 'burhanburdev@gmail.com'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
            onClick={() => void handleLogout()}
          >
            <LogOut className="mr-2 size-3.5" />
            Keluar Akun
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur-md md:hidden dark:border-slate-800/80 dark:bg-[#0D111D]/95">
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-lg bg-indigo-600 text-white">
            <Layers className="size-4" />
          </span>
          <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
            VESPER
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle size="sm" />
          <NotificationDropdown />
          <Button
            size="sm"
            className="h-8 px-2.5 text-xs"
            onClick={() => setQuickTxOpen(true)}
          >
            <Plus className="size-3.5" />
            Transaksi
          </Button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            {mobileMenuOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm md:hidden">
          <div className="fixed inset-y-0 right-0 flex w-3/4 max-w-xs flex-col justify-between border-l border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-slate-900 dark:text-white">
                  Menu Vesper
                </span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  <X className="size-5" />
                </button>
              </div>
              <nav className="space-y-1">
                {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
                  const isActive = currentPath === to
                  return (
                    <Link
                      key={to}
                      to={to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm ${isActive
                          ? 'bg-indigo-50 font-semibold text-indigo-600 dark:bg-indigo-600/20 dark:text-indigo-400'
                          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                    >
                      <Icon className="size-4" />
                      <span>{label}</span>
                    </Link>
                  )
                })}
              </nav>
            </div>
            <div className="border-t border-slate-200 pt-4 dark:border-slate-800">
              <Button
                variant="destructive"
                size="sm"
                className="w-full text-xs"
                onClick={() => void handleLogout()}
              >
                <LogOut className="mr-2 size-3.5" />
                Keluar Akun
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Desktop Topbar */}
        <div className="sticky top-0 z-30 hidden items-center justify-between border-b border-slate-200/80 bg-white/80 px-8 py-3.5 backdrop-blur-sm md:flex dark:border-slate-800/60 dark:bg-[#090D16]/80">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-3" />
              Backend Live
            </span>
            <span className="text-slate-400 dark:text-slate-600">•</span>
            <span>API v1 Ready</span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span>
              {new Intl.DateTimeFormat('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              }).format(new Date())}
            </span>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
            <ThemeToggle size="sm" />
            <NotificationDropdown />
          </div>
        </div>

        {/* Page Content */}
        <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Global Modals for Quick Actions */}
      <TransactionFormDialog open={quickTxOpen} onOpenChange={setQuickTxOpen} />
      <TransferFormDialog
        open={quickTransferOpen}
        onOpenChange={setQuickTransferOpen}
      />
    </div>
  )
}
