import { useNavigate } from '@tanstack/react-router'
import { Pencil, Plus, Target, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { BudgetFormDialog } from '@/features/budgets/components/budget-form-dialog'
import {
  getCurrentBudgetPeriod,
  useBudgetProgress,
  useBudgets,
  useDeleteBudget,
  type BudgetDto,
} from '@/features/budgets'
import { useCategories, type CategoryDto } from '@/features/categories'
import { formatDate, formatRupiah } from '@/lib/formatters'

interface BudgetCardProps {
  readonly budget: BudgetDto
  readonly category?: CategoryDto | undefined
  readonly onEdit: (budget: BudgetDto) => void
  readonly onDelete: (id: string) => void
}

function BudgetCardItem({
  budget,
  category,
  onEdit,
  onDelete,
}: BudgetCardProps) {
  const currentPeriod = getCurrentBudgetPeriod(budget.period_type)
  const { data: progress, isLoading: isProgressLoading } = useBudgetProgress(
    budget.id,
    currentPeriod,
  )

  const allowance = parseFloat(
    progress?.allowance ?? budget.current_amount ?? '0',
  )
  const spent = parseFloat(progress?.total_amount ?? '0')
  const remaining = parseFloat(
    progress?.remaining_amount ?? String(allowance - spent),
  )
  const percent =
    progress?.progress_percent != null
      ? parseFloat(progress.progress_percent)
      : allowance > 0
        ? (spent / allowance) * 100
        : 0

  const isOver = remaining < 0 || percent > 100
  const isNear = !isOver && percent >= 80
  const hasNoSpending = spent === 0
  const clampedPercent = Math.min(Math.max(percent, 0), 100)

  return (
    <Card className="flex flex-col justify-between space-y-4 p-5 transition-colors hover:border-indigo-500/30">
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎯</span>
              <h3 className="truncate text-base font-bold text-slate-900 dark:text-white">
                {category?.name || 'Kategori'}
              </h3>
            </div>
            <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
              {budget.description || `Mulai: ${formatDate(budget.anchor_date)}`}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <Badge variant="outline" className="text-[10px]">
              {budget.period_type}
            </Badge>
            <button
              type="button"
              onClick={() => onEdit(budget)}
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              title="Edit Anggaran"
            >
              <Pencil className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(budget.id)}
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:text-slate-500 dark:hover:bg-rose-950/50 dark:hover:text-rose-400"
              title="Hapus Anggaran"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-baseline justify-between text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400">Terpakai: </span>
              <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                {formatRupiah(spent)}
              </span>
              <span className="ml-1 text-[11px] text-slate-500 dark:text-slate-400">
                ({percent.toFixed(0)}%)
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 dark:text-slate-400">Batas: </span>
              <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                {formatRupiah(allowance)}
              </span>
            </div>
          </div>

          <Progress
            value={clampedPercent}
            max={100}
            indicatorClassName={
              isOver
                ? 'bg-rose-500'
                : isNear
                  ? 'bg-amber-500'
                  : hasNoSpending
                    ? 'bg-slate-300 dark:bg-slate-700'
                    : 'bg-emerald-500'
            }
          />

          <div className="flex items-center justify-between pt-0.5 text-[11px]">
            {isOver ? (
              <span className="font-medium text-rose-600 dark:text-rose-400">
                ⚠️ Melebihi anggaran ({formatRupiah(Math.abs(remaining))})
              </span>
            ) : isNear ? (
              <span className="font-medium text-amber-600 dark:text-amber-400">
                ⚡ Sisa: {formatRupiah(remaining)} (mendekati batas)
              </span>
            ) : hasNoSpending ? (
              <span className="text-slate-500 dark:text-slate-400">
                Belum ada pengeluaran • Sisa: {formatRupiah(remaining)}
              </span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400">
                ✓ Sisa alokasi: {formatRupiah(remaining)}
              </span>
            )}

            {isProgressLoading ? (
              <span className="text-[10px] text-slate-400">Menghitung…</span>
            ) : null}
          </div>
        </div>
      </div>
    </Card>
  )
}

export function BudgetsPage() {
  const navigate = useNavigate()
  const [budgetModalOpen, setBudgetModalOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<BudgetDto | null>(null)

  const { data: budgets = [], isLoading } = useBudgets()
  const { data: categories = [] } = useCategories()
  const deleteBudget = useDeleteBudget()

  const categoryMap = new Map(categories.map((c) => [c.id, c]))

  function handleCreateNew() {
    setEditingBudget(null)
    setBudgetModalOpen(true)
  }

  function handleEdit(budget: BudgetDto) {
    setEditingBudget(budget)
    setBudgetModalOpen(true)
  }

  async function handleDelete(id: string) {
    if (window.confirm('Hapus anggaran ini?')) {
      await deleteBudget.mutateAsync(id)
    }
  }

  const totalBudgetLimit = budgets.reduce(
    (sum, b) => sum + parseFloat(b.current_amount || '0'),
    0,
  )

  return (
    <AppShell onLogout={() => void navigate({ to: '/login', replace: true })}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2.5 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
              <Target className="size-7 text-indigo-600 dark:text-indigo-400" />
              Alokasi Anggaran (Budgets)
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Pantau dan batasi pengeluaran per kategori agar tidak melebihi
              rencana.
            </p>
          </div>

          <Button onClick={handleCreateNew} className="gap-2">
            <Plus className="size-4" />
            Buat Anggaran Baru
          </Button>
        </div>

        {/* Summary Card */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Card className="border-indigo-100 bg-white p-5 dark:border-indigo-500/20 dark:bg-slate-900/80">
            <p className="text-xs font-semibold tracking-wider text-indigo-600 uppercase dark:text-indigo-400">
              Total Batas Anggaran Terpasang
            </p>
            <p className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl dark:text-white">
              {formatRupiah(totalBudgetLimit)}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Akumulasi dari {budgets.length} kategori yang dianggarkan.
            </p>
          </Card>

          <Card className="border-emerald-100 bg-white p-5 dark:border-emerald-500/20 dark:bg-slate-900/80">
            <p className="text-xs font-semibold tracking-wider text-emerald-600 uppercase dark:text-emerald-400">
              Status Pengendalian Keuangan
            </p>
            <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
              {budgets.length > 0
                ? '✓ Alokasi Berjalan'
                : '⚠️ Belum Ada Anggaran'}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Sistem akan memperingatkan jika pengeluaran mendekati 80%.
            </p>
          </Card>
        </div>

        {/* Budget Cards Grid */}
        {isLoading ? (
          <Card className="p-12 text-center text-sm text-slate-500 dark:text-slate-400">
            Memuat data anggaran…
          </Card>
        ) : budgets.length === 0 ? (
          <Card className="p-12 text-center">
            <Target className="mx-auto mb-3 size-12 text-slate-400 dark:text-slate-600" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Belum Ada Anggaran
            </h3>
            <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
              Buat target pengeluaran pertama Anda (misalnya: Makan, Belanja,
              Transport).
            </p>
            <Button className="mt-4" onClick={handleCreateNew}>
              <Plus className="mr-1.5 size-4" /> Buat Anggaran Pertama
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {budgets.map((b) => (
              <BudgetCardItem
                key={b.id}
                budget={b}
                category={categoryMap.get(b.category_id)}
                onEdit={handleEdit}
                onDelete={(id) => void handleDelete(id)}
              />
            ))}
          </div>
        )}
      </div>

      <BudgetFormDialog
        key={editingBudget?.id ?? 'create'}
        open={budgetModalOpen}
        onOpenChange={(open) => {
          setBudgetModalOpen(open)
          if (!open) {
            setEditingBudget(null)
          }
        }}
        budgetToEdit={editingBudget}
      />
    </AppShell>
  )
}

