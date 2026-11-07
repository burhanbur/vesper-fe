import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, expect, it, vi } from 'vitest'

vi.mock('@/features/auth', () => ({
    useAuth: () => ({ user: { id: 'owner' } }),
}))
import type { AccountDto } from '../types/account'
import { CreditLimitForm } from './credit-limit-form'
import { CreditCardSummary } from './credit-card-summary'

const card: AccountDto = {
    id: 'card',
    user_id: 'owner',
    account_type_id: 'cash',
    parent_account_id: null,
    name: 'Card',
    icon: 'bank',
    currency: 'IDR',
    balance: '-1200000.00',
    is_credit_card: true,
    credit_limit: '1000000.00',
    description: null,
    is_visible: true,
    is_include_total: true,
    sequence_order: '0',
    version: '9007199254740993123',
    created_at: '',
    updated_at: '',
    deleted_at: null,
}
const server = setupServer()
const clients: QueryClient[] = []
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
    server.resetHandlers()
    clients.splice(0).forEach((client) => client.clear())
})
afterAll(() => server.close())

it.each(['0.01', ''])(
    'saves lower or untracked limit %s using only metadata and opaque version',
    async (limit) => {
        const payloads: unknown[] = []
        server.use(
            http.patch('*/accounts/card', async ({ request }) => {
                payloads.push(await request.json())
                return HttpResponse.json({
                    data: { ...card, credit_limit: limit || null },
                })
            }),
        )
        const client = new QueryClient({
            defaultOptions: { mutations: { retry: false } },
        })
        clients.push(client)
        client.setQueryData(['accounts', 'list'], [card])
        render(
            <QueryClientProvider client={client}>
                <CreditLimitForm account={card} />
            </QueryClientProvider>,
        )
        const user = userEvent.setup()
        const input = screen.getByLabelText('Limit Kredit (opsional)')
        await user.clear(input)
        if (limit) await user.type(input, limit)
        await user.click(screen.getByRole('button', { name: 'Simpan Limit' }))
        await screen.findByText('Limit berhasil diperbarui.')
        expect(payloads).toEqual([
            { version: card.version, credit_limit: limit || null },
        ])
        await waitFor(() =>
            expect(client.getQueryState(['accounts', 'list'])?.isInvalidated).toBe(
                true,
            ),
        )
    },
)

it('requires reconciliation after an uncertain limit update instead of reusing a stale version', async () => {
    let writes = 0
    server.use(
        http.patch('*/accounts/card', () => {
            writes++
            return HttpResponse.error()
        }),
    )
    const client = new QueryClient({
        defaultOptions: { mutations: { retry: false } },
    })
    clients.push(client)
    render(
        <QueryClientProvider client={client}>
            <CreditLimitForm account={card} />
        </QueryClientProvider>,
    )
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Simpan Limit' }))
    await screen.findByText(/Muat ulang detail sebelum mencoba lagi/)
    expect(screen.getByRole('button', { name: 'Simpan Limit' })).toBeDisabled()
    expect(writes).toBe(1)
})

it.each([
    { ...card, is_credit_card: false },
    { ...card, user_id: 'other' },
    { ...card, deleted_at: '2026-11-07T00:00:00Z' },
    { ...card, parent_account_id: 'parent' },
    { ...card, currency: 'USD' },
])('does not edit unsupported account metadata', (account) => {
    const client = new QueryClient()
    clients.push(client)
    render(
        <QueryClientProvider client={client}>
            <CreditLimitForm account={account} />
        </QueryClientProvider>,
    )
    expect(screen.getByRole('button', { name: 'Simpan Limit' })).toBeDisabled()
})

it('shows negative remaining limit and separate nonblocking overpayment', () => {
    const view = render(<CreditCardSummary account={card} />)
    expect(screen.getByText('-Rp 200.000,00')).toBeInTheDocument()
    view.rerender(
        <CreditCardSummary account={{ ...card, balance: '500000.00' }} />,
    )
    expect(screen.getByText('Rp 1.000.000,00')).toBeInTheDocument()
    expect(screen.getByText('Rp 500.000,00')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    view.rerender(<CreditCardSummary account={{ ...card, credit_limit: null }} />)
    expect(screen.getByText('Limit Tidak Dipantau')).toBeInTheDocument()
})
