import { useNavigate } from '@tanstack/react-router'
import { AppShell } from '@/components/layout/app-shell'
import { TransactionsView } from '@/features/transactions'

export function TransactionsPage() {
    const navigate = useNavigate()
    return (
        <AppShell onLogout={() => void navigate({ to: '/login', replace: true })}>
            <TransactionsView />
        </AppShell>
    )
}
