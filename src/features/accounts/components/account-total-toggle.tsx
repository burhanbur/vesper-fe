import { Calculator } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUpdateAccount } from '../hooks/use-accounts'
import type { AccountDto } from '../types/account'
import { cn } from '@/lib/utils'

type AccountTotalToggleProps = {
  readonly account: AccountDto
  readonly className?: string
}

export function AccountTotalToggle({
  account,
  className,
}: AccountTotalToggleProps) {
  const updateAccount = useUpdateAccount()
  const inclusionLabel = account.is_include_total
    ? 'Masuk total'
    : 'Tidak masuk total'

  return (
    <div className={cn('flex flex-col items-end gap-1', className)}>
      <Button
        variant="outline"
        size="sm"
        aria-label={`Sertakan ${account.name} dalam total`}
        aria-pressed={account.is_include_total}
        disabled={updateAccount.isPending}
        title="Pengaturan ini terpisah dari visibilitas akun."
        className={cn(
          'h-7 rounded-lg px-2.5 text-[11px] font-medium transition-all',
          account.is_include_total
            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300'
            : 'border-slate-800 bg-slate-900/60 text-slate-500 hover:bg-slate-800 hover:text-slate-400',
        )}
        onClick={() =>
          updateAccount.mutate({
            id: account.id,
            input: {
              version: account.version,
              is_include_total: !account.is_include_total,
            },
          })
        }
      >
        <Calculator
          className={cn(
            'mr-1 size-3.5',
            account.is_include_total ? 'text-emerald-400' : 'text-slate-500',
          )}
          aria-hidden="true"
        />
        {updateAccount.isPending ? 'Menyimpan…' : inclusionLabel}
      </Button>
      {updateAccount.isError && (
        <p role="alert" className="max-w-48 text-xs text-rose-400">
          Gagal mengubah pengaturan total. Coba lagi.
        </p>
      )}
    </div>
  )
}
