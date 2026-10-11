import { useNavigate } from '@tanstack/react-router'
import { AppShell } from '@/components/layout/app-shell'
import { MoneyManagerWizard } from '@/features/money-manager'

export function ImportPage() {
  const navigate = useNavigate()

  return (
    <AppShell onLogout={() => void navigate({ to: '/login', replace: true })}>
      <MoneyManagerWizard />
    </AppShell>
  )
}
