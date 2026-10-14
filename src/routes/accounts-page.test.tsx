import { HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterAll, afterEach, beforeAll, expect, it, vi } from 'vitest'
import type { AccountDto } from '@/features/accounts/types/account'
import { AccountsPage } from './accounts-page'

const { navigate } = vi.hoisted(() => ({ navigate: vi.fn() }))
vi.mock('@tanstack/react-router', () => ({ useNavigate: () => navigate }))
vi.mock('@/components/layout/app-shell', () => ({
    AppShell: ({ children }: { children: React.ReactNode }) => (
        <main>{children}</main>
    ),
}))

const parent: AccountDto = {
    id: 'bank',
    user_id: 'user',
    account_type_id: 'type',
    parent_account_id: null,
    icon: 'bank',
    name: 'Bank Utama',
    currency: 'IDR',
    balance: '12500.00',
    description: 'Rekening pribadi',
    is_visible: true,
    is_include_total: false,
    sequence_order: '0',
    version: '1',
    created_at: '2026-10-01T10:00:00.000Z',
    updated_at: '2026-10-12T11:00:00.000Z',
    deleted_at: null,
}
const child: AccountDto = {
    ...parent,
    id: 'pocket',
    name: 'Dana Darurat',
    parent_account_id: 'bank',
    balance: '3000.00',
    description: null,
    is_include_total: true,
}
let writes = 0
const server = setupServer(
    http.get('*/accounts', () => HttpResponse.json({ data: [parent, child] })),
    http.get('*/account-types', () =>
        HttpResponse.json({
            data: [
                {
                    id: 'type',
                    name: 'Bank',
                    category: 'CASH',
                    user_id: 'user',
                    version: '1',
                    created_at: parent.created_at,
                    updated_at: parent.updated_at,
                    deleted_at: null,
                },
            ],
        }),
    ),
    http.patch('*/accounts/:id', () => {
        writes++
        return HttpResponse.json({ data: parent })
    }),
)
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
    server.resetHandlers()
    writes = 0
    navigate.mockClear()
})
afterAll(() => server.close())

it('navigates to exact root and pocket detail routes without changing hierarchy or visibility', async () => {
    const user = userEvent.setup()
    const client = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    })
    render(
        <QueryClientProvider client={client}>
            <AccountsPage />
        </QueryClientProvider>,
    )
    const rootTrigger = await screen.findByRole('button', {
        name: 'Lihat detail akun Bank Utama',
    })
    await user.click(rootTrigger)
    expect(navigate).toHaveBeenLastCalledWith({
        to: '/accounts/$accountId',
        params: { accountId: parent.id },
    })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    const childTrigger = screen.getByRole('button', {
        name: 'Lihat detail akun Dana Darurat',
    })
    await user.click(childTrigger)
    expect(navigate).toHaveBeenLastCalledWith({
        to: '/accounts/$accountId',
        params: { accountId: child.id },
    })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByText('1 Kantong')).toBeVisible()
    expect(writes).toBe(0)
    client.clear()
})
