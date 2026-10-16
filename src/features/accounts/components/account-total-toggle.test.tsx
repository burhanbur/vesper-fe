import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, expect, it } from 'vitest'
import type { AccountDto } from '../types/account'
import { AccountTotalToggle } from './account-total-toggle'

const account: AccountDto = {
  id: 'account-1',
  user_id: 'user',
  account_type_id: 'type',
  parent_account_id: null,
  name: 'Utang',
  currency: 'IDR',
  balance: '-100',
  is_visible: false,
  is_include_total: true,
  version: '3',
  icon: null,
  description: null,
  sequence_order: '0',
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

function renderToggle(included: boolean) {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  })
  clients.push(client)
  client.setQueryData(['accounts', 'list'], [account])
  render(
    <QueryClientProvider client={client}>
      <AccountTotalToggle
        account={{ ...account, is_include_total: included }}
      />
    </QueryClientProvider>,
  )
  return client
}

it.each([true, false])(
  'updates only inclusion and version when included=%s',
  async (included) => {
    const payloads: unknown[] = []
    server.use(
      http.patch('*/accounts/account-1', async ({ request }) => {
        payloads.push(await request.json())
        return HttpResponse.json({
          data: { ...account, is_include_total: !included },
        })
      }),
    )
    const client = renderToggle(included)
    const button = screen.getByRole('button', {
      name: 'Sertakan Utang dalam total',
    })
    expect(button).toHaveAttribute('aria-pressed', String(included))
    await userEvent.setup().click(button)
    await waitFor(() =>
      expect(payloads).toEqual([{ version: '3', is_include_total: !included }]),
    )
    await waitFor(() =>
      expect(client.getQueryState(['accounts', 'list'])?.isInvalidated).toBe(
        true,
      ),
    )
  },
)

it('shows an actionable error when saving fails', async () => {
  server.use(
    http.patch('*/accounts/account-1', () =>
      HttpResponse.json({}, { status: 409 }),
    ),
  )
  renderToggle(true)
  await userEvent
    .setup()
    .click(screen.getByRole('button', { name: 'Sertakan Utang dalam total' }))
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Gagal mengubah pengaturan total',
  )
  expect(screen.getByRole('button')).toBeEnabled()
})
