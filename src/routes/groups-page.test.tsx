import { HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
    afterAll,
    afterEach,
    beforeAll,
    describe,
    expect,
    it,
    vi,
} from 'vitest'
import { GroupsPage } from './groups-page'

const { navigate } = vi.hoisted(() => ({ navigate: vi.fn() }))
vi.mock('@tanstack/react-router', () => ({ useNavigate: () => navigate }))
vi.mock('@/components/layout/app-shell', () => ({
    AppShell: ({ children }: { children: React.ReactNode }) => (
        <main>{children}</main>
    ),
}))

const mockGroup = {
    id: 'group-1',
    name: 'Keluarga Bahagia',
    is_active: true,
    role: 'OWNER',
    code: 'INVITE123',
    created_at: '2026-10-01T00:00:00.000Z',
    updated_at: '2026-10-01T00:00:00.000Z',
}

const server = setupServer(
    http.get('*/groups', () => HttpResponse.json({ data: [mockGroup] })),
    http.get('*/groups/:groupId/members', () =>
        HttpResponse.json({
            data: [
                {
                    user_id: 'user-1',
                    name: 'Sarah Mafazi',
                    role: 'OWNER',
                    profile: null,
                    created_at: '2026-10-01T00:00:00.000Z',
                },
            ],
        }),
    ),
    http.get('*/groups/:groupId/pockets', () =>
        HttpResponse.json({
            data: [
                {
                    id: 'pocket-1',
                    name: 'Belanja Dapur',
                    description: null,
                    balances: [{ currency: 'IDR', balance: '1000000.00' }],
                    accounts: [],
                },
            ],
        }),
    ),
    http.get('*/groups/:groupId/accounts', () => HttpResponse.json({ data: [] })),
    http.get('*/groups/:groupId/collaboration', () =>
        HttpResponse.json({
            data: {
                period: '2026-11',
                page: 1,
                limit: 20,
                balances: [{ currency: 'IDR', balance: '5000000.00' }],
                contributions: [],
                feed: [],
            },
        }),
    ),
    http.get('*/groups/:groupId/categories', () =>
        HttpResponse.json({ data: [] }),
    ),
    http.get('*/groups/:groupId/category-mappings', () =>
        HttpResponse.json({ data: [] }),
    ),
    http.get('*/groups/:groupId/category-report', () =>
        HttpResponse.json({ data: { period: '2026-11', categories: [] } }),
    ),
    http.get('*/accounts', () => HttpResponse.json({ data: [] })),
    http.get('*/account-types', () => HttpResponse.json({ data: [] })),
)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
    server.resetHandlers()
    navigate.mockClear()
})
afterAll(() => server.close())

describe('GroupsPage', () => {
    it('renders aligned tabs with Kantong & Saldo as default tab', async () => {
        const user = userEvent.setup()
        const client = new QueryClient({
            defaultOptions: { queries: { retry: false } },
        })

        render(
            <QueryClientProvider client={client}>
                <GroupsPage />
            </QueryClientProvider>,
        )

        // Verifies group title
        expect(await screen.findByText('Keluarga Bahagia')).toBeInTheDocument()

        // Verifies tab labels matching mobile apps structure
        expect(screen.getByText('Kantong & Saldo')).toBeInTheDocument()
        expect(screen.getByText('Aktivitas & Mutasi')).toBeInTheDocument()
        expect(screen.getByText('Anggota & Akses')).toBeInTheDocument()
        expect(screen.getByText('Kategori & Laporan')).toBeInTheDocument()

        // Verifies default tab displays Kantong Tujuan Grup
        expect(await screen.findByText('Kantong Tujuan Grup')).toBeInTheDocument()
        expect(screen.getByText('Belanja Dapur')).toBeInTheDocument()

        // Switch to Aktivitas tab
        await user.click(screen.getByRole('tab', { name: /Aktivitas & Mutasi/i }))

        // Verifies collaboration view rendered without fake unified totals
        expect(
            await screen.findByText('Kolaborasi Kas Bersama Online'),
        ).toBeInTheDocument()
        expect(screen.getByText('Kas (IDR)')).toBeInTheDocument()
        expect(screen.queryByText('Total Kas Bersama')).not.toBeInTheDocument()
        expect(screen.queryByText('Pemasukan Gabungan')).not.toBeInTheDocument()
    })
})
