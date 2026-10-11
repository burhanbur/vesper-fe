import {
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from '@tanstack/react-router'
import { RootLayout } from '@/app/router/root-layout'
import { authSession } from '@/features/auth'
import { AccountsPage } from '@/routes/accounts-page'
import { BudgetsPage } from '@/routes/budgets-page'
import { DashboardPage } from '@/routes/dashboard-page'
import { GroupsPage } from '@/routes/groups-page'
import { InvestmentsPage } from '@/routes/investments-page'
import { LoginPage } from '@/routes/login-page'
import { NotFoundPage } from '@/routes/not-found-page'
import { RouteErrorPage } from '@/routes/route-error-page'
import { SettingsPage } from '@/routes/settings-page'
import { TransactionsPage } from '@/routes/transactions-page'

const rootRoute = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFoundPage,
  errorComponent: ({ error, reset }) => (
    <RouteErrorPage error={error} reset={reset} />
  ),
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    const destination =
      authSession.getSnapshot().status === 'authenticated'
        ? '/dashboard'
        : '/login'
    return redirect({ to: destination })
  },
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  beforeLoad: () => {
    if (authSession.getSnapshot().status === 'authenticated') {
      return redirect({ to: '/dashboard' })
    }
  },
  component: LoginPage,
})

function requireAuth() {
  if (authSession.getSnapshot().status !== 'authenticated') {
    return redirect({ to: '/login' })
  }
}

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  beforeLoad: requireAuth,
  component: DashboardPage,
})

const accountsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/accounts',
  beforeLoad: requireAuth,
  component: AccountsPage,
})

const transactionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/transactions',
  beforeLoad: requireAuth,
  component: TransactionsPage,
})

const budgetsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/budgets',
  beforeLoad: requireAuth,
  component: BudgetsPage,
})

const investmentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/investments',
  beforeLoad: requireAuth,
  component: InvestmentsPage,
})

const groupsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/groups',
  beforeLoad: requireAuth,
  component: GroupsPage,
})

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  beforeLoad: requireAuth,
  component: SettingsPage,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  dashboardRoute,
  accountsRoute,
  transactionsRoute,
  budgetsRoute,
  investmentsRoute,
  groupsRoute,
  settingsRoute,
])

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  scrollRestoration: true,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
