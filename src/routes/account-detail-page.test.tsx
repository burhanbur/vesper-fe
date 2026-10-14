import type { ReactNode } from 'react'
import { HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterAll, afterEach, beforeAll, expect, it, vi } from 'vitest'
import { AccountDetailPage } from './account-detail-page'

const parentId = '019a0000-0000-7000-8000-000000000001'
const childId = '019a0000-0000-7000-8000-000000000002'
const { route } = vi.hoisted(() => ({
    route: { accountId: '019a0000-0000-7000-8000-000000000001' },
}))
vi.mock('@tanstack/react-router', () => ({
    useNavigate: () => vi.fn(),
    useParams: () => route,
    Link: ({ children, to }: { children: ReactNode; to: string }) => (
        <a href={to}>{children}</a>
    ),
}))
vi.mock('@/components/layout/app-shell', () => ({
    AppShell: ({ children }: { children: ReactNode }) => <main>{children}</main>,
}))
const accounts = [
    {
        id: parentId,
        name: 'Bank Utama',
        balance: '12500.00',
        currency: 'IDR',
        parent_account_id: null,
    },
    {
        id: childId,
        name: 'Dana Darurat',
        balance: '3000.00',
        currency: 'IDR',
        parent_account_id: parentId,
    },
]
const requests: URL[] = []
const server = setupServer(
    http.get('*/accounts', () => HttpResponse.json({ data: accounts })),
    http.get('*/categories', () => HttpResponse.json({ data: [] })),
    http.get('*/account-types', () => HttpResponse.json({ data: [] })),
    http.get('*/transactions', ({ request }) => {
        const url = new URL(request.url)
        requests.push(url)
        const page = Number(url.searchParams.get('page'))
        return HttpResponse.json({
            data: [
                {
                    id: `tx-${page}`,
                    account_id: url.searchParams.get('account_id'),
                    category_id: null,
                    type: 'INCOME',
                    description: `Transaksi halaman ${page}`,
                    amount: '100.00',
                    transacted_at: '2026-10-01T10:00:00.000Z',
                    version: '1',
                },
            ],
            pagination: {
                total: 51,
                per_page: 50,
                current_page: page,
                last_page: 2,
                from: 1,
                to: 50,
            },
        })
    }),
)
const clients: QueryClient[] = []
function renderDetail() {
    const client = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    })
    clients.push(client)
    return render(
        <QueryClientProvider client={client}>
            <AccountDetailPage />
        </QueryClientProvider>,
    )
}
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
    server.resetHandlers()
    requests.length = 0
    route.accountId = parentId
    clients.forEach((client) => client.clear())
    clients.length = 0
})
afterAll(() => server.close())

it.each([parentId, childId])(
    'scopes transactions and pagination to exact account %s',
    async (id) => {
        route.accountId = id
        const user = userEvent.setup()
        renderDetail()
        expect(await screen.findByText('Transaksi halaman 1')).toBeVisible()
        expect(
            screen.getByRole('heading', {
                name: id === parentId ? 'Bank Utama' : 'Dana Darurat',
            }),
        ).toBeVisible()
        expect(screen.getByText('IDR')).toBeVisible()
        expect(
            screen.getByText(id === parentId ? /12\.500/ : /3\.000/),
        ).toBeVisible()
        expect(
            screen.getByRole('link', { name: 'Kembali ke akun' }),
        ).toHaveAttribute('href', '/accounts')
        expect(screen.getByLabelText('Akun / Rekening')).toBeDisabled()
        expect(screen.getByText(/bukan gabungan akun anak/)).toBeVisible()
        await user.click(screen.getByRole('button', { name: 'Berikutnya' }))
        expect(await screen.findByText('Transaksi halaman 2')).toBeVisible()
        expect(requests.map((url) => url.searchParams.get('account_id'))).toEqual([
            id,
            id,
        ])
        expect(requests.map((url) => url.searchParams.get('page'))).toEqual([
            '1',
            '2',
        ])
        expect(
            requests.every((url) => url.searchParams.get('limit') === '50'),
        ).toBe(true)
        await user.selectOptions(screen.getByLabelText('Tipe Transaksi'), 'EXPENSE')
        await waitFor(() =>
            expect(requests.at(-1)?.searchParams.get('page')).toBe('1'),
        )
        expect(requests.at(-1)?.searchParams.get('account_id')).toBe(id)
    },
)

it('shows loading while transaction history is pending', async () => {
    let release: (() => void) | undefined
    const pending = new Promise<void>((resolve) => {
        release = resolve
    })
    server.use(
        http.get('*/transactions', async () => {
            await pending
            return HttpResponse.json({ data: [] })
        }),
    )
    renderDetail()
    expect(await screen.findByText('Memuat data transaksi…')).toBeVisible()
    release?.()
    expect(await screen.findByText('Tidak Ada Transaksi')).toBeVisible()
})

it('finds child and parent context across paginated accounts', async () => {
    route.accountId = childId
    const pages: string[] = []
    server.use(
        http.get('*/accounts', ({ request }) => {
            const page = new URL(request.url).searchParams.get('page') ?? '1'
            pages.push(page)
            return HttpResponse.json({
                data: page === '1' ? [accounts[1]] : [accounts[0]],
                pagination: { current_page: Number(page), last_page: 2 },
            })
        }),
    )
    renderDetail()
    expect(await screen.findByText('Transaksi halaman 1')).toBeVisible()
    expect(screen.getByText('Bank Utama', { selector: 'dd' })).toBeVisible()
    expect(pages).toContain('2')
})

it('shows empty transactions instead of invented account history', async () => {
    server.use(http.get('*/transactions', () => HttpResponse.json({ data: [] })))
    renderDetail()
    expect(await screen.findByText('Tidak Ada Transaksi')).toBeVisible()
})

it('retries failed transaction requests', async () => {
    let fail = true
    server.use(
        http.get('*/transactions', () =>
            fail
                ? HttpResponse.json({}, { status: 500 })
                : HttpResponse.json({ data: [] }),
        ),
    )
    renderDetail()
    expect(await screen.findByText('Gagal memuat transaksi.')).toBeVisible()
    fail = false
    await userEvent.click(screen.getByRole('button', { name: 'Coba lagi' }))
    expect(await screen.findByText('Tidak Ada Transaksi')).toBeVisible()
})

it('does not request transactions when the account is missing', async () => {
    server.use(http.get('*/accounts', () => HttpResponse.json({ data: [] })))
    renderDetail()
    expect(await screen.findByText('Akun tidak ditemukan.')).toBeVisible()
    expect(requests).toHaveLength(0)
})

it('handles account dependency failures without requesting transactions', async () => {
    server.use(
        http.get('*/accounts', () => HttpResponse.json({}, { status: 500 })),
    )
    renderDetail()
    expect(await screen.findByText('Gagal memuat detail akun.')).toBeVisible()
    expect(requests).toHaveLength(0)
})
