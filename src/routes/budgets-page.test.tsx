import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import type { BudgetDto, BudgetProgressDto } from '@/features/budgets'
import type { CategoryDto } from '@/features/categories'
import { BudgetsPage } from './budgets-page'

const { navigate } = vi.hoisted(() => ({ navigate: vi.fn() }))
vi.mock('@tanstack/react-router', () => ({ useNavigate: () => navigate }))
vi.mock('@/components/layout/app-shell', () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => (
    <main>{children}</main>
  ),
}))

const mockCategory: CategoryDto = {
  id: 'cat-vehicle',
  user_id: 'user-1',
  name: 'Vehicle',
  type: 'EXPENSE',
  version: '1',
  created_at: '2026-10-01T00:00:00.000Z',
  updated_at: '2026-10-01T00:00:00.000Z',
  deleted_at: null,
}

const mockBudget: BudgetDto = {
  id: 'budget-1',
  category_id: 'cat-vehicle',
  anchor_date: '2026-10-23',
  period_type: 'MONTHLY',
  base_currency: 'IDR',
  icon: null,
  description: 'Bensin & servis bulanan',
  sequence_order: '0',
  current_amount: '250000.00',
  created_at: '2026-10-23T00:00:00.000Z',
  updated_at: '2026-10-23T00:00:00.000Z',
  deleted_at: null,
}

const mockProgress: BudgetProgressDto = {
  budget: mockBudget,
  period: '2026-10',
  start: '2026-10-23T00:00:00.000Z',
  end: '2026-11-23T00:00:00.000Z',
  period_days: 31,
  total_amount: '0.00',
  allowance: '250000.00',
  remaining_amount: '250000.00',
  progress_percent: '0.00',
}

let patchPayload: unknown = null
let deletedId: string | null = null

const server = setupServer(
  http.get('*/budgets', () => HttpResponse.json({ data: [mockBudget] })),
  http.get('*/categories', () => HttpResponse.json({ data: [mockCategory] })),
  http.get('*/budgets/:id/progress', () =>
    HttpResponse.json({ data: mockProgress }),
  ),
  http.patch('*/budgets/:id', async ({ request }) => {
    patchPayload = await request.json()
    return HttpResponse.json({ data: mockBudget })
  }),
  http.delete('*/budgets/:id', ({ params }) => {
    deletedId = params.id as string
    return new HttpResponse(null, { status: 204 })
  }),
)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  server.resetHandlers()
  patchPayload = null
  deletedId = null
  navigate.mockClear()
})
afterAll(() => server.close())

function renderBudgetsPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <BudgetsPage />
    </QueryClientProvider>,
  )
}

describe('BudgetsPage', () => {
  it('renders budget card with accurate 0% spending and real progress details', async () => {
    renderBudgetsPage()

    expect(await screen.findByText('Vehicle')).toBeInTheDocument()
    expect(screen.getByText('Bensin & servis bulanan')).toBeInTheDocument()

    // Real progress should show 0% and no spending
    await waitFor(() => {
      expect(screen.getByText(/Belum ada pengeluaran/i)).toBeInTheDocument()
    })
    expect(screen.getAllByText('Rp 250.000').length).toBeGreaterThanOrEqual(1)
  })

  it('allows opening edit modal and submitting an amount update', async () => {
    const user = userEvent.setup()
    renderBudgetsPage()

    expect(await screen.findByText('Vehicle')).toBeInTheDocument()

    const editBtn = screen.getByTitle('Edit Anggaran')
    await user.click(editBtn)

    expect(
      screen.getByRole('heading', { name: /Edit Alokasi Anggaran/i }),
    ).toBeInTheDocument()

    // Category should be locked
    expect(screen.getByLabelText(/Kategori Pengeluaran/i)).toBeDisabled()

    // Update amount
    const amountInput = screen.getByLabelText(/Batas Anggaran/i)
    await user.clear(amountInput)
    await user.type(amountInput, '350000')

    const submitBtn = screen.getByRole('button', {
      name: /Simpan Perubahan/i,
    })
    await user.click(submitBtn)

    await waitFor(() => {
      expect(patchPayload).toEqual({
        amount: '350000.00',
        description: 'Bensin & servis bulanan',
      })
    })
  })

  it('allows deleting a budget after confirmation', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    renderBudgetsPage()

    expect(await screen.findByText('Vehicle')).toBeInTheDocument()

    const deleteBtn = screen.getByTitle('Hapus Anggaran')
    await user.click(deleteBtn)

    await waitFor(() => {
      expect(deletedId).toBe('budget-1')
    })
  })
})
