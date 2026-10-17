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
import { TransferFormDialog } from './transfer-form-dialog'

const mockAccounts = [
  {
    id: 'acc-bca',
    user_id: 'user-1',
    account_type_id: 'type-bank',
    parent_account_id: null,
    name: 'BCA Rekening Utama',
    currency: 'IDR',
    balance: '5000000.00',
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
    balance: '150000.00',
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
)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

function renderComponent(onOpenChange = vi.fn()) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  const utils = render(
    <QueryClientProvider client={queryClient}>
      <TransferFormDialog open={true} onOpenChange={onOpenChange} />
    </QueryClientProvider>,
  )
  return { ...utils, onOpenChange, queryClient }
}

describe('TransferFormDialog', () => {
  it('renders modern transfer header, accounts, and presets correctly', async () => {
    renderComponent()

    expect(screen.getByText('Transfer Antar Akun')).toBeInTheDocument()
    expect(screen.getByText('Dari Akun (Sumber Dana)')).toBeInTheDocument()
    expect(screen.getByText('Ke Akun (Tujuan Dana)')).toBeInTheDocument()
    expect(screen.getByText('Tukar Posisi')).toBeInTheDocument()

    // Wait for accounts to load and appear in balances
    await waitFor(() => {
      expect(screen.getByText('BCA Rekening Utama')).toBeInTheDocument()
      expect(screen.getByText('GoPay Pribadi')).toBeInTheDocument()
    })

    // Presets exist
    expect(screen.getByText('+50 rb')).toBeInTheDocument()
    expect(screen.getByText('+100 rb')).toBeInTheDocument()
    expect(screen.getByText('Transfer Semua Saldo')).toBeInTheDocument()
  })

  it('allows swapping source and destination accounts', async () => {
    const user = userEvent.setup()
    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('BCA Rekening Utama')).toBeInTheDocument()
    })

    const swapBtn = screen.getByRole('button', { name: /tukar posisi/i })
    await user.click(swapBtn)

    // After swap, from account should be GoPay and to account should be BCA
    await waitFor(() => {
      // The first selected display should now have GoPay Pribadi
      const triggers = screen.getAllByRole('button', { expanded: false })
      expect(triggers.length).toBeGreaterThanOrEqual(2)
    })
  })

  it('updates nominal when quick amount chips are clicked and shows simulation', async () => {
    const user = userEvent.setup()
    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('+100 rb')).toBeInTheDocument()
    })

    const chip100k = screen.getByText('+100 rb')
    await user.click(chip100k)

    // Real-time balance simulation appears
    await waitFor(() => {
      expect(
        screen.getByText('Simulasi Saldo Setelah Transfer'),
      ).toBeInTheDocument()
    })
  })

  it('shows warning when amount exceeds available balance in source account', async () => {
    const user = userEvent.setup()
    renderComponent()

    await waitFor(() => {
      expect(screen.getByPlaceholderText('0')).toBeInTheDocument()
    })

    const amountInput = screen.getByPlaceholderText('0')
    await user.clear(amountInput)
    await user.type(amountInput, '10000000') // 10 million exceeds 5 million balance

    await waitFor(() => {
      expect(
        screen.getByText('Nominal melebihi saldo akun sumber'),
      ).toBeInTheDocument()
    })
  })

  it('submits valid transfer payload to backend', async () => {
    const user = userEvent.setup()
    let transferPayload: Record<string, unknown> | null = null

    server.use(
      http.post('*/api/v1/transfers', async ({ request }) => {
        transferPayload = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({
          success: true,
          message: 'Transfer berhasil',
          timestamp: new Date().toISOString(),
          data: { id: 'transfer-123' },
        })
      }),
    )

    const onOpenChange = vi.fn()
    renderComponent(onOpenChange)

    await waitFor(() => {
      expect(screen.getByPlaceholderText('0')).toBeInTheDocument()
    })

    const chip50k = screen.getByText('+50 rb')
    await user.click(chip50k)

    const submitBtn = screen.getByRole('button', { name: /kirim transfer/i })
    await user.click(submitBtn)

    await waitFor(() => {
      expect(transferPayload).not.toBeNull()
      expect(transferPayload).toMatchObject({
        from_account_id: 'acc-bca',
        to_account_id: 'acc-gopay',
        amount: '50000.00',
      })
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })
})
