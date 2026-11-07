import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, expect, it, vi } from 'vitest'
import { TransactionFormDialog } from './transaction-form-dialog'
import { TransferFormDialog } from './transfer-form-dialog'
import { AccountFormDialog } from '@/features/accounts/components/account-form-dialog'
import type { AccountDto } from '@/features/accounts'

const rollout = vi.hoisted(() => ({ enabled: true }))
vi.mock('@/config/env', () => ({
    env: {
        apiBaseUrl: 'http://localhost:3000/api/v1',
        get enableCreditCardCreation() {
            return rollout.enabled
        },
    },
}))
vi.mock('@/features/auth', () => ({
    useAuth: () => ({ user: { id: 'owner' } }),
}))
vi.mock('@/hooks/use-timezone', () => ({
    useTimezone: () => ({ timezone: 'Asia/Jakarta' }),
}))
const card: AccountDto = {
    id: 'card',
    user_id: 'owner',
    account_type_id: 'cash',
    parent_account_id: null,
    name: 'Kartu Pribadi',
    icon: 'bank',
    currency: 'IDR',
    balance: '-2000000.00',
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
const bank = {
    ...card,
    id: 'bank',
    name: 'Bank Utama',
    is_credit_card: false,
    credit_limit: null,
    balance: '9007199254740993.01',
}
const server = setupServer()
const clients: QueryClient[] = []
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
    rollout.enabled = true
    server.resetHandlers()
    clients.splice(0).forEach((client) => client.clear())
})
afterAll(() => server.close())
function setup(accounts = [bank, card]) {
    server.use(
        http.get('*/accounts', () => HttpResponse.json({ data: accounts })),
        http.get('*/account-types', () =>
            HttpResponse.json({
                data: [
                    { id: 'cash', name: 'Bank', category: 'CASH' },
                    { id: 'investment', name: 'Investasi', category: 'INVESTMENT' },
                ],
            }),
        ),
        http.get('*/categories', () =>
            HttpResponse.json({
                data: [{ id: 'food', name: 'Belanja', type: 'EXPENSE' }],
            }),
        ),
    )
    const client = new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })
    clients.push(client)
    for (const key of [
        'accounts',
        'transactions',
        'dashboard',
        'budgets',
        'unrelated',
    ])
        client.setQueryData([key, 'sentinel'], [])
    return client
}
function mount(client: QueryClient, element: React.ReactNode) {
    return render(
        <QueryClientProvider client={client}>{element}</QueryClientProvider>,
    )
}

it('keeps new card creation disabled until compatibility is verified', () => {
    rollout.enabled = false
    const client = setup()
    mount(client, <AccountFormDialog open onOpenChange={() => undefined} />)
    expect(screen.getByLabelText('Kartu Kredit (pribadi)')).toBeDisabled()
    expect(
        screen.getByText(/Pembuatan kartu kredit belum tersedia/),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Simpan Akun' })).toBeEnabled()
})

it('creates a private IDR CASH root card at zero without an opening ledger write', async () => {
    const client = setup()
    const payloads: unknown[] = []
    server.use(
        http.post('*/accounts', async ({ request }) => {
            payloads.push(await request.json())
            return HttpResponse.json({ data: { ...card, balance: '0.00' } })
        }),
    )
    mount(client, <AccountFormDialog open onOpenChange={() => undefined} />)
    const user = userEvent.setup()
    await user.click(screen.getByLabelText('Kartu Kredit (pribadi)'))
    await screen.findByRole('option', { name: 'Bank (CASH)' })
    expect(
        screen.queryByRole('option', { name: 'Investasi (INVESTMENT)' }),
    ).not.toBeInTheDocument()
    expect(
        screen.getByLabelText('Akun Induk (Opsional — untuk Sub-Kantong)'),
    ).toBeDisabled()
    await user.type(screen.getByLabelText('Nama Akun / Rekening'), 'Kartu Baru')
    await user.selectOptions(screen.getByLabelText('Tipe Akun'), 'cash')
    await user.type(
        screen.getByLabelText('Limit Kredit (opsional)'),
        '9007199254740993.01',
    )
    await user.click(screen.getByRole('button', { name: 'Simpan Akun' }))
    await waitFor(() => expect(payloads).toHaveLength(1))
    expect(payloads[0]).toMatchObject({
        is_credit_card: true,
        credit_limit: '9007199254740993.01',
        currency: 'IDR',
        parent_account_id: null,
    })
    expect(payloads[0]).not.toHaveProperty('balance')
})

it('allows correction after definite account rejection without treating it as an uncertain write', async () => {
    const client = setup()
    let writes = 0
    server.use(
        http.post('*/accounts', () => {
            writes++
            return HttpResponse.json(
                { message: 'Permintaan tidak valid.' },
                { status: 422 },
            )
        }),
    )
    mount(client, <AccountFormDialog open onOpenChange={() => undefined} />)
    const user = userEvent.setup()
    await user.click(screen.getByLabelText('Kartu Kredit (pribadi)'))
    await screen.findByRole('option', { name: 'Bank (CASH)' })
    await user.type(screen.getByLabelText('Nama Akun / Rekening'), 'Kartu Baru')
    await user.selectOptions(screen.getByLabelText('Tipe Akun'), 'cash')
    await user.click(screen.getByRole('button', { name: 'Simpan Akun' }))
    await screen.findByText('Akun ditolak. Periksa isian sebelum mencoba lagi.')
    expect(screen.getByRole('button', { name: 'Simpan Akun' })).toBeEnabled()
    expect(writes).toBe(1)
})

it('allows an over-limit exact expense, never offers cards for income, and invalidates affected queries', async () => {
    const client = setup([card, bank])
    const payloads: unknown[] = []
    server.use(
        http.post('*/transactions', async ({ request }) => {
            payloads.push(await request.json())
            return HttpResponse.json({ data: {} })
        }),
    )
    mount(client, <TransactionFormDialog open onOpenChange={() => undefined} />)
    const user = userEvent.setup()
    const input = await screen.findByLabelText('Nominal Pengeluaran (IDR)')
    await user.type(input, '9007199254740993.01')
    await user.click(screen.getByRole('button', { name: 'Simpan Pengeluaran' }))
    await waitFor(() => expect(payloads).toHaveLength(1))
    expect(payloads[0]).toMatchObject({
        account_id: 'card',
        type: 'EXPENSE',
        amount: '9007199254740993.01',
    })
    for (const key of ['accounts', 'transactions', 'dashboard', 'budgets'])
        expect(client.getQueryState([key, 'sentinel'])?.isInvalidated).toBe(true)
    expect(client.getQueryState(['unrelated', 'sentinel'])?.isInvalidated).toBe(
        false,
    )
    await user.click(screen.getByRole('button', { name: 'Pemasukan' }))
    expect(
        screen.queryByLabelText('Nominal Pengeluaran (IDR)'),
    ).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Bank Utama/ }))
    expect(
        screen.queryByRole('option', { name: /Kartu Pribadi/ }),
    ).not.toBeInTheDocument()
})

it('records bank-to-card overpayment once without an extra confirmation and retains uncertain outcome', async () => {
    const client = setup()
    const payloads: unknown[] = []
    server.use(
        http.post('*/transfers', async ({ request }) => {
            payloads.push(await request.json())
            return HttpResponse.error()
        }),
    )
    mount(client, <TransferFormDialog open onOpenChange={() => undefined} />)
    await screen.findByText(/Pencatatan ini tidak melakukan pembayaran ke bank/)
    const input = screen.getByLabelText('Nominal Transfer')
    const user = userEvent.setup()
    await user.type(input, '2500000.01')
    expect(screen.getByText('Rp 500.000,01')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Tukar Posisi/ })).toBeDisabled()
    const submit = screen.getByRole('button', { name: 'Kirim Transfer' })
    const form = submit.closest('form')
    if (!form) throw new Error('Missing form')
    fireEvent.submit(form)
    fireEvent.submit(form)
    await screen.findByText(/Hasil transfer belum dapat dipastikan/)
    expect(payloads).toHaveLength(1)
    expect(payloads[0]).toMatchObject({
        from_account_id: 'bank',
        to_account_id: 'card',
        amount: '2500000.01',
    })
    expect(submit).toBeDisabled()
    fireEvent.submit(form)
    expect(payloads).toHaveLength(1)
})

it('preserves overpayment through repayment and subsequent expenses using existing endpoints', async () => {
    const client = setup([bank, card])
    const writes: { path: string; input: unknown }[] = []
    server.use(
        http.post('*/transfers', async ({ request }) => {
            writes.push({ path: 'transfers', input: await request.json() })
            return HttpResponse.json({ data: {} })
        }),
        http.post('*/transactions', async ({ request }) => {
            writes.push({ path: 'transactions', input: await request.json() })
            return HttpResponse.json({ data: {} })
        }),
    )
    const user = userEvent.setup()
    const payment = mount(
        client,
        <TransferFormDialog open onOpenChange={() => undefined} />,
    )
    await screen.findByText(/Pencatatan ini tidak melakukan pembayaran ke bank/)
    await user.type(screen.getByLabelText('Nominal Transfer'), '2500000.00')
    expect(screen.getByText('Rp 500.000,00')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Kirim Transfer' }))
    await waitFor(() => expect(writes).toHaveLength(1))
    payment.unmount()

    for (const step of [
        { balance: '500000.00', amount: '200000.00', display: 'Rp 300.000,00' },
        { balance: '300000.00', amount: '400000.00', display: 'Rp 100.000,00' },
    ]) {
        client.setQueryData(
            ['accounts', 'list', undefined],
            [{ ...card, balance: step.balance }, bank],
        )
        server.use(
            http.get('*/accounts', () =>
                HttpResponse.json({ data: [{ ...card, balance: step.balance }, bank] }),
            ),
        )
        // Clear cached list variants so the next form receives authoritative account reads.
        client.removeQueries({ queryKey: ['accounts'] })
        const expense = mount(
            client,
            <TransactionFormDialog open onOpenChange={() => undefined} />,
        )
        await user.type(
            await screen.findByLabelText('Nominal Pengeluaran (IDR)'),
            step.amount,
        )
        expect(screen.getByText(step.display)).toBeInTheDocument()
        await user.click(screen.getByRole('button', { name: 'Simpan Pengeluaran' }))
        await waitFor(() =>
            expect(
                writes.filter((write) => write.path === 'transactions'),
            ).toHaveLength(step.amount === '200000.00' ? 1 : 2),
        )
        expense.unmount()
    }
    expect(writes).toHaveLength(3)
    expect(writes.map((write) => write.path)).toEqual([
        'transfers',
        'transactions',
        'transactions',
    ])
    expect(writes[0]?.input).toMatchObject({
        from_account_id: 'bank',
        to_account_id: 'card',
        amount: '2500000.00',
    })
    expect(writes[1]?.input).toMatchObject({
        account_id: 'card',
        type: 'EXPENSE',
        amount: '200000.00',
    })
    expect(writes[2]?.input).toMatchObject({
        account_id: 'card',
        type: 'EXPENSE',
        amount: '400000.00',
    })
})

it('does not offer foreign-owner cards or card-origin transfers', async () => {
    const client = setup([bank, { ...card, user_id: 'someone-else' }])
    mount(client, <TransferFormDialog open onOpenChange={() => undefined} />)
    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: /Bank Utama/ }))
    expect(
        screen.queryByRole('option', { name: /Kartu Pribadi/ }),
    ).not.toBeInTheDocument()
    expect(
        screen.queryByText(/Pencatatan ini tidak melakukan pembayaran ke bank/),
    ).not.toBeInTheDocument()
})
