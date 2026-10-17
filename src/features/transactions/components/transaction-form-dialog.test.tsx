import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'
import {
    afterAll,
    afterEach,
    beforeAll,
    describe,
    expect,
    it,
    vi,
} from 'vitest'
import { TransactionFormDialog } from './transaction-form-dialog'

const mockAccounts = [
    {
        id: 'acc-bca',
        user_id: 'user-1',
        account_type_id: 'type-bank',
        parent_account_id: null,
        name: 'BCA Rekening Utama',
        currency: 'IDR',
        balance: '2500000.00',
        description: null,
        is_visible: true,
        is_include_total: true,
        sequence_order: '0',
        version: '1',
        icon: null,
        created_at: '2026-01-01',
        updated_at: '2026-01-01',
        deleted_at: null,
    },
    {
        id: 'acc-gopay',
        user_id: 'user-1',
        account_type_id: 'type-ewallet',
        parent_account_id: null,
        name: 'GoPay Pribadi',
        currency: 'IDR',
        balance: '50000.00',
        description: null,
        is_visible: true,
        is_include_total: true,
        sequence_order: '1',
        version: '1',
        icon: null,
        created_at: '2026-01-01',
        updated_at: '2026-01-01',
        deleted_at: null,
    },
]

const mockAccountTypes = [
    {
        id: 'type-bank',
        user_id: 'user-1',
        name: 'Bank',
        category: 'CASH',
        version: '1',
        created_at: '2026-01-01',
        updated_at: '2026-01-01',
        deleted_at: null,
    },
    {
        id: 'type-ewallet',
        user_id: 'user-1',
        name: 'e-Wallet',
        category: 'CASH',
        version: '1',
        created_at: '2026-01-01',
        updated_at: '2026-01-01',
        deleted_at: null,
    },
]

const mockCategories = [
    {
        id: 'cat-food',
        user_id: 'user-1',
        name: 'Makanan & Minuman',
        type: 'EXPENSE',
        icon: 'utensils',
        color: '#ef4444',
        created_at: '2026-01-01',
        updated_at: '2026-01-01',
    },
    {
        id: 'cat-salary',
        user_id: 'user-1',
        name: 'Gaji Pokok',
        type: 'INCOME',
        icon: 'wallet',
        color: '#10b981',
        created_at: '2026-01-01',
        updated_at: '2026-01-01',
    },
]

let createdTransactionPayload: unknown = null

const server = setupServer(
    http.get('*/api/v1/accounts', () => {
        return HttpResponse.json({
            success: true,
            message: 'OK',
            timestamp: new Date().toISOString(),
            total_data: mockAccounts.length,
            data: mockAccounts,
        })
    }),
    http.get('*/api/v1/account-types', () => {
        return HttpResponse.json({
            success: true,
            message: 'OK',
            timestamp: new Date().toISOString(),
            total_data: mockAccountTypes.length,
            data: mockAccountTypes,
        })
    }),
    http.get('*/api/v1/categories', ({ request }) => {
        const url = new URL(request.url)
        const type = url.searchParams.get('type')
        const filtered = type
            ? mockCategories.filter((c) => c.type === type)
            : mockCategories
        return HttpResponse.json({
            success: true,
            message: 'OK',
            timestamp: new Date().toISOString(),
            total_data: filtered.length,
            data: filtered,
        })
    }),
    http.post('*/api/v1/transactions', async ({ request }) => {
        createdTransactionPayload = await request.json()
        return HttpResponse.json({
            success: true,
            message: 'Transaksi berhasil disimpan',
            timestamp: new Date().toISOString(),
            data: {
                id: 'tx-new',
                ...(createdTransactionPayload as object),
            },
        })
    }),
)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
    server.resetHandlers()
    createdTransactionPayload = null
})
afterAll(() => server.close())

function renderComponent(
    initialType: 'INCOME' | 'EXPENSE' = 'EXPENSE',
    onOpenChange = vi.fn(),
) {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    })
    const utils = render(
        <QueryClientProvider client={queryClient}>
            <TransactionFormDialog
                open={true}
                onOpenChange={onOpenChange}
                initialType={initialType}
            />
        </QueryClientProvider>,
    )
    return { ...utils, onOpenChange, queryClient }
}

describe('TransactionFormDialog', () => {
    it('renders modern transaction dialog with segmented toggle, accounts, and presets', async () => {
        renderComponent()

        expect(screen.getByText('Catat Transaksi Baru')).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /^pengeluaran$/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /^pemasukan$/i }),
        ).toBeInTheDocument()
        expect(screen.getByText('Nominal Transaksi')).toBeInTheDocument()

        // Wait for accounts and categories to load
        await waitFor(() => {
            expect(screen.getByText('BCA Rekening Utama')).toBeInTheDocument()
            expect(screen.getByText('Makanan & Minuman')).toBeInTheDocument()
        })

        // Presets for expense
        expect(screen.getByText('+50 rb')).toBeInTheDocument()
        expect(screen.getByText('+100 rb')).toBeInTheDocument()
    })

    it('toggles between Pengeluaran and Pemasukan, adapting presets and recommendations', async () => {
        const user = userEvent.setup()
        renderComponent('EXPENSE')

        await waitFor(() => {
            expect(screen.getByText('Makanan & Minuman')).toBeInTheDocument()
        })

        // Switch to Pemasukan
        const incomeBtn = screen.getByRole('button', { name: /^pemasukan$/i })
        await user.click(incomeBtn)

        // Presets should change to income-oriented amounts
        await waitFor(() => {
            expect(screen.getByText('+1 jt')).toBeInTheDocument()
            expect(screen.getByText('+5 jt')).toBeInTheDocument()
            expect(screen.getByText('Gaji Pokok')).toBeInTheDocument()
        })
    })

    it('updates nominal on quick chip clicks and displays real-time balance simulation', async () => {
        const user = userEvent.setup()
        renderComponent('EXPENSE')

        await waitFor(() => {
            expect(screen.getByText('+100 rb')).toBeInTheDocument()
        })

        const chip100k = screen.getByText('+100 rb')
        await user.click(chip100k)

        // Balance simulation card should render
        await waitFor(() => {
            expect(screen.getByText('Simulasi Saldo Rekening')).toBeInTheDocument()
            expect(screen.getByText('Saldo Setelah Transaksi')).toBeInTheDocument()
            expect(screen.getByText('Rp 2.400.000')).toBeInTheDocument()
        })
    })

    it('shows warning alert when expense amount exceeds account balance', async () => {
        const user = userEvent.setup()
        renderComponent('EXPENSE')

        await waitFor(() => {
            expect(screen.getByText('BCA Rekening Utama')).toBeInTheDocument()
        })

        // Select GoPay which only has 50.000 balance
        const accountTrigger = screen.getByText('BCA Rekening Utama')
        await user.click(accountTrigger)

        const gopayOption = await screen.findByText('GoPay Pribadi')
        await user.click(gopayOption)

        // Click +100 rb preset chip (exceeds 50.000)
        const chip100k = screen.getByText('+100 rb')
        await user.click(chip100k)

        await waitFor(() => {
            expect(
                screen.getByText('Nominal melebihi saldo akun'),
            ).toBeInTheDocument()
        })
    })

    it('submits transaction with correct payload and closes dialog', async () => {
        const user = userEvent.setup()
        const onOpenChange = vi.fn()
        renderComponent('EXPENSE', onOpenChange)

        await waitFor(() => {
            expect(screen.getByText('Makanan & Minuman')).toBeInTheDocument()
        })

        // Click quick preset +50 rb
        const chip50k = screen.getByText('+50 rb')
        await user.click(chip50k)

        // Click quick note "Makan & Minum"
        const noteChip = screen.getByRole('button', { name: 'Makan & Minum' })
        await user.click(noteChip)

        // Submit form
        const submitBtn = screen.getByRole('button', {
            name: /simpan pengeluaran/i,
        })
        expect(submitBtn).toBeEnabled()
        await user.click(submitBtn)

        await waitFor(() => {
            expect(createdTransactionPayload).toMatchObject({
                account_id: 'acc-bca',
                category_id: 'cat-food',
                type: 'EXPENSE',
                amount: '50000.00',
                description: 'Makan & Minum',
            })
            expect(onOpenChange).toHaveBeenCalledWith(false)
        })
    })
})
