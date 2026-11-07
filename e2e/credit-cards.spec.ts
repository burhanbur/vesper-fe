import { expect, test } from '@playwright/test'

for (const viewport of [
    { width: 1280, height: 900 },
    { width: 390, height: 844 },
]) {
    test(`mocked card summary and keyboard limit edit at ${viewport.width}px`, async ({
        page,
    }) => {
        await page.setViewportSize(viewport)
        const owner = '019a0000-0000-7000-8000-000000000001'
        const card = {
            id: '019a0000-0000-7000-8000-000000000002',
            user_id: owner,
            account_type_id: 'cash',
            name: 'Kartu Uji',
            currency: 'IDR',
            parent_account_id: null,
            icon: 'bank',
            balance: '500000.01',
            is_credit_card: true,
            credit_limit: '1000000.00',
            description: null,
            is_visible: true,
            is_include_total: true,
            sequence_order: '0',
            version: '9007199254740993123',
            created_at: '2026-11-07T00:00:00Z',
            updated_at: '2026-11-07T00:00:00Z',
            deleted_at: null,
        }
        const writes: unknown[] = []
        // Match API paths, not Vite modules such as /src/features/auth/api/auth-session.ts.
        // All API traffic is mocked; no real credentials, tokens or financial data.
        await page.route(/\/api\//, async (route) => {
            const request = route.request()
            const path = new URL(request.url()).pathname
            if (!path.startsWith('/api/')) {
                await route.continue()
                return
            }
            let data: unknown = []
            if (path.endsWith('/auth/login') || path.endsWith('/auth/refresh')) {
                await route.fulfill({
                    json: {
                        success: true,
                        message: 'OK',
                        timestamp: '2026-11-07 00:00:00',
                        data: {
                            user: {
                                id: owner,
                                name: 'Test User',
                                email: 'mock@example.test',
                                status: 'ACTIVE',
                                roles: [],
                            },
                            access_token: 'mock-access',
                            refresh_token: 'mock-refresh',
                            token_type: 'Bearer',
                            expires_at: '2099-01-01T00:00:00Z',
                            refresh_expires_at: '2099-02-01T00:00:00Z',
                        },
                    },
                })
                return
            }
            if (path.endsWith(`/accounts/${card.id}`)) {
                if (request.method() === 'PATCH') {
                    const input: unknown = request.postDataJSON()
                    writes.push(input)
                    if (
                        typeof input === 'object' &&
                        input !== null &&
                        'credit_limit' in input &&
                        typeof input.credit_limit === 'string'
                    )
                        card.credit_limit = input.credit_limit
                }
                data = card
            } else if (path.endsWith('/accounts')) data = [card]
            else if (path.endsWith('/account-types'))
                data = [{ id: 'cash', name: 'Bank', category: 'CASH' }]
            else if (path.endsWith('/summary'))
                data = {
                    income_total: '0.00',
                    expense_total: '0.00',
                    transfer_total: '0.00',
                }
            await route.fulfill({
                json: {
                    success: true,
                    message: 'OK',
                    data,
                    timestamp: '2026-11-07 00:00:00',
                },
            })
        })
        await page.goto('/login')
        await page.getByLabel(/username or email/i).fill('mock@example.test')
        await page.getByLabel(/password/i).fill('mock-password')
        await page.getByRole('button', { name: 'Sign in', exact: true }).click()
        await page.waitForURL((url) => url.pathname === '/dashboard')
        await page.goto(`/accounts/${card.id}`)
        await expect(page.getByRole('heading', { name: 'Kartu Uji' })).toBeVisible()
        await expect(
            page.getByText('Kelebihan Bayar:', { exact: true }),
        ).toBeVisible()
        await expect(
            page.getByText('Rp 1.000.000,00', { exact: true }),
        ).toBeVisible()
        const limit = page.getByLabel('Limit Kredit (opsional)')
        await limit.fill('0.01')
        await limit.press('Tab')
        await expect(
            page.getByRole('button', { name: 'Simpan Limit' }),
        ).toBeFocused()
        await page.keyboard.press('Enter')
        await expect.poll(() => writes.length).toBe(1)
        expect(writes[0]).toEqual({ version: card.version, credit_limit: '0.01' })
        expect(
            await page
                .locator('html')
                .evaluate<boolean, void, { scrollWidth: number; clientWidth: number }>(
                    (element) => element.scrollWidth <= element.clientWidth,
                ),
        ).toBe(true)
    })
}
