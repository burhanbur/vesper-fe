import { HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { GroupCollaborationView } from './group-collaboration-view'
import type { GroupMemberDto } from '../types/group'

const mockMembers: GroupMemberDto[] = [
    {
        user_id: 'user-1',
        role: 'OWNER',
        name: 'Sarah Mafazi',
        profile: null,
        created_at: '2026-10-01T00:00:00.000Z',
    },
    {
        user_id: 'user-2',
        role: 'MEMBER',
        name: 'Burhan Mafazi',
        profile: null,
        created_at: '2026-10-02T00:00:00.000Z',
    },
]

const server = setupServer(
    http.get('*/groups/:groupId/collaboration', () =>
        HttpResponse.json({
            data: {
                period: '2026-11',
                page: 1,
                limit: 20,
                balances: [
                    { currency: 'IDR', balance: '15000000.00' },
                    { currency: 'USD', balance: '1200.50' },
                ],
                contributions: [
                    {
                        user_id: 'user-1',
                        currency: 'IDR',
                        income: '5000000.00',
                        expense: '1500000.00',
                    },
                    {
                        user_id: 'user-2',
                        currency: 'IDR',
                        income: '0.00',
                        expense: '2500000.00',
                    },
                ],
                feed: [
                    {
                        id: 'tx-1',
                        user_id: 'user-1',
                        currency: 'IDR',
                        amount: '1500000.00',
                        type: 'EXPENSE',
                        category: 'Belanja Dapur',
                        transacted_at: '2026-11-04T12:00:00.000Z',
                    },
                ],
            },
        }),
    ),
)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('GroupCollaborationView', () => {
    it('renders per-currency balances and contributions without fake unified totals', async () => {
        const client = new QueryClient({
            defaultOptions: { queries: { retry: false } },
        })

        render(
            <QueryClientProvider client={client}>
                <GroupCollaborationView
                    groupId="group-1"
                    members={mockMembers}
                    period="2026-11"
                    onPeriodChange={() => { }}
                />
            </QueryClientProvider>,
        )

        // Verifies online informational notice matching mobile
        expect(
            screen.getByText('Kolaborasi Kas Bersama Online'),
        ).toBeInTheDocument()
        expect(
            screen.getByText(/Saldo akun CASH yang dibagikan, per mata uang/i),
        ).toBeInTheDocument()

        // Verifies per-currency cards exist
        expect(await screen.findByText('Kas (IDR)')).toBeInTheDocument()
        expect(screen.getByText('Rp 15.000.000')).toBeInTheDocument()
        expect(screen.getByText('Kas (USD)')).toBeInTheDocument()
        expect(screen.getByText('USD 1.200,5')).toBeInTheDocument()

        // Verifies fake aggregated totals are NOT rendered
        expect(screen.queryByText('Total Kas Bersama')).not.toBeInTheDocument()
        expect(screen.queryByText('Pemasukan Gabungan')).not.toBeInTheDocument()
        expect(screen.queryByText('Pengeluaran Gabungan')).not.toBeInTheDocument()
        expect(screen.queryByText('Arus Kas Bersih')).not.toBeInTheDocument()
        expect(
            screen.queryByText(/Porsi Pengeluaran Grup/i),
        ).not.toBeInTheDocument()

        // Verifies member contributions are rendered with Inflow and Outflow
        expect(screen.getByText('Sarah Mafazi')).toBeInTheDocument()
        expect(screen.getByText('Burhan Mafazi')).toBeInTheDocument()
        expect(screen.getByText('+ Rp 5.000.000')).toBeInTheDocument()
        expect(screen.getAllByText('- Rp 1.500.000')).toHaveLength(2)
        expect(screen.getByText('- Rp 2.500.000')).toBeInTheDocument()

        // Verifies feed item
        expect(screen.getByText('Belanja Dapur')).toBeInTheDocument()

        // Verifies pagination controls
        expect(screen.getByText('Halaman 1')).toBeInTheDocument()
        expect(screen.getByText('Halaman Sebelumnya')).toBeDisabled()
    })
})
