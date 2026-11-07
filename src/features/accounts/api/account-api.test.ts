import { HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, expect, it } from 'vitest'
import {
    createAccount,
    fetchAccounts,
    parseAccount,
    updateAccount,
} from './account-api'
import type { AccountDto } from '../types/account'

const legacy = {
    id: 'account',
    user_id: 'owner',
    account_type_id: 'cash',
    parent_account_id: null,
    name: 'BCA',
    currency: 'IDR',
    balance: '9007199254740993.01',
    version: '9007199254740993123',
    deleted_at: null,
}
const server = setupServer()
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

it('defaults legacy collection metadata and preserves exact balance/version transport', async () => {
    server.use(
        http.get('*/accounts', () => HttpResponse.json({ data: [legacy] })),
    )
    expect(await fetchAccounts()).toEqual([
        { ...legacy, is_credit_card: false, credit_limit: null },
    ])
})

it.each([
    { balance: 9007199254740992 },
    { balance: '1e9' },
    { balance: '0.001' },
    { version: 9007199254740992 },
    { version: undefined },
    { credit_limit: 1000000 },
    { credit_limit: '0.00' },
])('rejects lossy or invalid account transport %j', (fields) => {
    // Deliberately malformed external JSON at the API boundary.
    expect(() =>
        parseAccount({ ...legacy, ...fields } as unknown as AccountDto),
    ).toThrow()
})

it('round-trips card creation without introducing an opening balance', async () => {
    const payloads: unknown[] = []
    const input = {
        account_type_id: 'cash',
        name: 'Card',
        is_credit_card: true,
        credit_limit: '999999999999999999.99',
    }
    server.use(
        http.post('*/accounts', async ({ request }) => {
            payloads.push(await request.json())
            return HttpResponse.json({
                data: { ...legacy, ...input, balance: '0.00' },
            })
        }),
    )
    const result = await createAccount(input)
    expect(payloads).toEqual([input])
    expect(result.credit_limit).toBe(input.credit_limit)
    expect(result.balance).toBe('0.00')
})

it('preserves omission on unrelated edits, but sends explicit null when clearing a limit', async () => {
    const payloads: unknown[] = []
    server.use(
        http.patch('*/accounts/account', async ({ request }) => {
            payloads.push(await request.json())
            return HttpResponse.json({
                data: { ...legacy, is_credit_card: true, credit_limit: null },
            })
        }),
    )
    await updateAccount('account', {
        version: legacy.version,
        is_include_total: false,
    })
    await updateAccount('account', {
        version: legacy.version,
        credit_limit: null,
    })
    expect(payloads).toEqual([
        { version: legacy.version, is_include_total: false },
        { version: legacy.version, credit_limit: null },
    ])
})
