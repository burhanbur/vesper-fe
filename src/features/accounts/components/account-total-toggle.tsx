import { Calculator } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUpdateAccount } from '../hooks/use-accounts'
import type { AccountDto } from '../types/account'

type AccountTotalToggleProps = {
    readonly account: AccountDto
}

export function AccountTotalToggle({ account }: AccountTotalToggleProps) {
    const updateAccount = useUpdateAccount()
    const inclusionLabel = account.is_include_total
        ? 'Masuk total'
        : 'Tidak masuk total'

    return (
        <div className="flex flex-col items-end gap-1">
            <Button
                variant="outline"
                size="sm"
                aria-label={`Sertakan ${account.name} dalam total`}
                aria-pressed={account.is_include_total}
                disabled={updateAccount.isPending}
                title="Pengaturan ini terpisah dari visibilitas akun."
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
                <Calculator className="mr-1 size-4" aria-hidden="true" />
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
