import { HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { GroupPocketsView } from './group-pockets-view'
import type { GroupPocketDto } from '../types/group'

const mockPockets: GroupPocketDto[] = [
    {
        id: 'pocket-1',
        name: 'Belanja Bulanan',
        description: 'Alokasi belanja dapur bersama',
        balances: [{ currency: 'IDR', balance: '4500000.00' }],
        accounts: [
            {
                account_id: 'acc-1',
                name: 'BCA Operasional',
                owner_user_id: 'user-1',
                owner_name: 'Budi Santoso',
                currency: 'IDR',
                balance: '4500000.00',
            },
        ],
    },
]

const mockAccounts = [
    {
        id: 'acc-1',
        user_id: 'user-1',
        account_type_id: 'type-1',
        parent_account_id: null,
        name: 'BCA Operasional',
        currency: 'IDR',
        balance: '4500000.00',
        description: null,
        is_visible: true,
        is_include_total: true,
        sequence_order: '0',
        version: '1',
        created_at: '2026-10-01T00:00:00.000Z',
        updated_at: '2026-10-01T00:00:00.000Z',
        deleted_at: null,
    },
    {
        id: 'acc-2',
        user_id: 'user-1',
        account_type_id: 'type-1',
        parent_account_id: null,
        name: 'Mandiri Tabungan',
        currency: 'IDR',
        balance: '2000000.00',
        description: null,
        is_visible: true,
        is_include_total: true,
        sequence_order: '1',
        version: '1',
        created_at: '2026-10-01T00:00:00.000Z',
        updated_at: '2026-10-01T00:00:00.000Z',
        deleted_at: null,
    },
]

let createdPocketName = ''
let assignedAccountId = ''
let unassignedAccountId = ''

const server = setupServer(
    http.get('*/groups/:groupId/pockets', () =>
        HttpResponse.json({ data: mockPockets }),
    ),
    http.get('*/accounts', () => HttpResponse.json({ data: mockAccounts })),
    http.get('*/account-types', () =>
        HttpResponse.json({
            data: [
                {
                    id: 'type-1',
                    name: 'Bank',
                    category: 'CASH',
                    user_id: 'user-1',
                    version: '1',
                    created_at: '2026-10-01T00:00:00.000Z',
                    updated_at: '2026-10-01T00:00:00.000Z',
                    deleted_at: null,
                },
            ],
        }),
    ),
    http.post('*/groups/:groupId/pockets', async ({ request }) => {
        const body = (await request.json()) as { name: string }
        createdPocketName = body.name
        return HttpResponse.json({
            data: {
                id: 'pocket-new',
                name: body.name,
                description: null,
                balances: [],
                accounts: [],
            },
        })
    }),
    http.post(
        '*/groups/:groupId/pockets/:pocketId/accounts',
        async ({ request }) => {
            const body = (await request.json()) as { account_id: string }
            assignedAccountId = body.account_id
            return HttpResponse.json({ data: null })
        },
    ),
    http.delete(
        '*/groups/:groupId/pockets/:pocketId/accounts',
        async ({ request }) => {
            const body = (await request.json()) as { account_id: string }
            unassignedAccountId = body.account_id
            return HttpResponse.json({ data: null })
        },
    ),
)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
    server.resetHandlers()
    createdPocketName = ''
    assignedAccountId = ''
    unassignedAccountId = ''
})
afterAll(() => server.close())

describe('GroupPocketsView', () => {
    it('renders group pockets with transparent notice, balances, and linked accounts', async () => {
        const client = new QueryClient({
            defaultOptions: { queries: { retry: false } },
        })

        render(
            <QueryClientProvider client={client}>
                <GroupPocketsView groupId="group-1" />
            </QueryClientProvider>,
        )

        // Verifies header & transparent badge
        expect(screen.getByText('Kantong Tujuan Grup')).toBeInTheDocument()
        expect(screen.getByText('TRANSPARAN')).toBeInTheDocument()

        // Verifies notice
        expect(
            screen.getByText(
                /Seluruh saldo akun ditautkan, bukan dipindahkan atau dicadangkan/i,
            ),
        ).toBeInTheDocument()

        // Verifies pocket card and balance
        expect(await screen.findByText('Belanja Bulanan')).toBeInTheDocument()
        expect(
            screen.getByText('Alokasi belanja dapur bersama'),
        ).toBeInTheDocument()
        expect(screen.getByText('1 akun')).toBeInTheDocument()
        expect(screen.getByText('Rp 4.500.000')).toBeInTheDocument()
        expect(screen.getByText('Budi: BCA Operasional')).toBeInTheDocument()
    })

    it('opens create pocket modal and handles pocket creation', async () => {
        const user = userEvent.setup()
        const client = new QueryClient({
            defaultOptions: { queries: { retry: false } },
        })

        render(
            <QueryClientProvider client={client}>
                <GroupPocketsView groupId="group-1" />
            </QueryClientProvider>,
        )

        expect(await screen.findByText('Belanja Bulanan')).toBeInTheDocument()

        // Click create button
        await user.click(
            screen.getByRole('button', { name: /Buat Kantong Tujuan/i }),
        )

        // Check dialog
        expect(screen.getByText('Buat Kantong Tujuan Baru')).toBeInTheDocument()

        // Fill in form
        await user.type(screen.getByLabelText(/Nama Kantong/i), 'Dana Liburan')
        await user.type(
            screen.getByLabelText(/Deskripsi/i),
            'Jalan-jalan akhir tahun',
        )

        await user.click(screen.getByRole('button', { name: 'Buat Kantong' }))

        await waitFor(() => {
            expect(createdPocketName).toBe('Dana Liburan')
        })
    })

    it('opens manage modal and allows unlinking an account', async () => {
        const user = userEvent.setup()
        const client = new QueryClient({
            defaultOptions: { queries: { retry: false } },
        })

        render(
            <QueryClientProvider client={client}>
                <GroupPocketsView groupId="group-1" />
            </QueryClientProvider>,
        )

        expect(await screen.findByText('Belanja Bulanan')).toBeInTheDocument()

        // Click manage button
        await user.click(screen.getByRole('button', { name: /Kelola & Rincian/i }))

        // Check details modal
        expect(screen.getByText('Kantong: Belanja Bulanan')).toBeInTheDocument()

        // Unlink account
        const unlinkBtn = screen.getByTitle('Lepas dari kantong')
        await user.click(unlinkBtn)

        await waitFor(() => {
            expect(unassignedAccountId).toBe('acc-1')
        })

        // Link eligible candidate account (acc-2)
        const select = screen.getByRole('combobox')
        await user.selectOptions(select, 'acc-2')
        await user.click(screen.getByRole('button', { name: /Tautkan Akun/i }))

        await waitFor(() => {
            expect(assignedAccountId).toBe('acc-2')
        })
    })
})
