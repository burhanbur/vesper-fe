import { useNavigate } from '@tanstack/react-router'
import { Plus, Target, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { BudgetFormDialog } from '@/features/budgets/components/budget-form-dialog'
import { useBudgets, useDeleteBudget } from '@/features/budgets'
import { useCategories } from '@/features/categories'
import { formatDate, formatRupiah } from '@/lib/formatters'

export function BudgetsPage() {
  const navigate = useNavigate()
  const [budgetModalOpen, setBudgetModalOpen] = useState(false)

  const { data: budgets = [], isLoading } = useBudgets()
  const { data: categories = [] } = useCategories()
  const deleteBudget = useDeleteBudget()

  const categoryMap = new Map(categories.map((c) => [c.id, c]))

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

          <Button onClick={() => setBudgetModalOpen(true)} className="gap-2">
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
            <Button className="mt-4" onClick={() => setBudgetModalOpen(true)}>
              <Plus className="mr-1.5 size-4" /> Buat Anggaran Pertama
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {budgets.map((b) => {
              const cat = categoryMap.get(b.category_id)
              const allowance = parseFloat(b.current_amount || '0')

              return (
                <Card
                  key={b.id}
                  className="flex flex-col justify-between space-y-4 p-5 transition-colors hover:border-indigo-500/30"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">🎯</span>
                          <h3 className="truncate text-base font-bold text-slate-900 dark:text-white">
                            {cat?.name || 'Kategori'}
                          </h3>
                        </div>
                        <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                          {b.description ||
                            `Mulai: ${formatDate(b.anchor_date)}`}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-1">
                        <Badge variant="outline" className="text-[10px]">
                          {b.period_type}
                        </Badge>
                        <button
                          type="button"
                          onClick={() => void handleDelete(b.id)}
                          className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-400"
                          title="Hapus Anggaran"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-400">Batas Anggaran:</span>
                        <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                          {formatRupiah(allowance)}
                        </span>
                      </div>
                      <Progress value={25} max={100} />
                      <p className="pt-0.5 text-[11px] text-emerald-600 dark:text-emerald-400">
                        Sisa alokasi terkendali
                      </p>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      <BudgetFormDialog
        open={budgetModalOpen}
        onOpenChange={setBudgetModalOpen}
      />
    </AppShell>
  )
}
