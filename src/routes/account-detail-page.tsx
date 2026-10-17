import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { AppShell } from '@/components/layout/app-shell'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAccountDetail } from '@/features/accounts/hooks/use-account-detail'
import { TransactionsView } from '@/features/transactions'

export function AccountDetailPage() {
    const { accountId } = useParams({ from: '/accounts/$accountId' })
    const navigate = useNavigate()
    const { data, isPending, isError, refetch } = useAccountDetail(accountId)
    const account = data?.account

    return (
        <AppShell onLogout={() => void navigate({ to: '/login', replace: true })}>
            <div className="space-y-6">
                <Link
                    to="/accounts"
                    className="text-sm text-indigo-300 underline focus-visible:outline"
                >
                    Kembali ke akun
                </Link>
                {isPending ? (
                    <Card className="p-8" role="status">
                        Memuat detail akun…
                    </Card>
                ) : isError ? (
                    <Card className="p-8" role="alert">
                        <p>Gagal memuat detail akun.</p>
                        <Button onClick={() => void refetch()}>Coba lagi</Button>
                    </Card>
                ) : !account ? (
                    <Card className="p-8">Akun tidak ditemukan.</Card>
                ) : (
                    <TransactionsView
                        key={accountId}
                        accountId={accountId}
                        header={
                            <Card className="space-y-3 p-5">
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {account.name}
                                </h1>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {account.description || 'Tidak ada deskripsi'}
                                </p>
                                <dl className="grid gap-4 sm:grid-cols-3">
                                    <div>
                                        <dt className="text-sm text-slate-500 dark:text-slate-400">
                                            Saldo akun (bukan gabungan)
                                        </dt>
                                        <dd className="font-mono text-lg font-bold text-slate-900 dark:text-white">
                                            {new Intl.NumberFormat('id-ID', {
                                                style: 'currency',
                                                currency: account.currency,
                                            }).format(Number(account.balance))}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm text-slate-500 dark:text-slate-400">Mata uang</dt>
                                        <dd className="font-medium text-slate-900 dark:text-slate-200">{account.currency}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm text-slate-500 dark:text-slate-400">Akun induk</dt>
                                        <dd className="font-medium text-slate-900 dark:text-slate-200">
                                            {data?.parent?.name ??
                                                (account.parent_account_id
                                                    ? 'Akun induk tidak tersedia'
                                                    : 'Tidak ada (akun utama)')}
                                        </dd>
                                    </div>
                                </dl>
                            </Card>
                        }
                    />
                )}
            </div>
        </AppShell>
    )
}
