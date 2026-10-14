import { HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { fetchDashboardSummary } from './dashboard-api'

const server = setupServer()
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('dashboard summary API', () => {
    it('sends the period and validates full server totals independently of the feed', async () => {
        server.use(
            http.get('*/dashboard/summary', ({ request }) => {
                const url = new URL(request.url)
                expect(url.searchParams.get('period')).toBe('monthly')
                expect(url.searchParams.get('value')).toBe('2026-10')
                expect(url.searchParams.get('end_value')).toBe('2026-10')
                return HttpResponse.json({
                    data: {
                        period: 'monthly',
                        value: '2026-10',
                        end_value: '2026-10',
                        timezone: 'Asia/Jakarta',
                        start_at: '2026-09-30T17:00:00.000Z',
                        end_at: '2026-10-31T17:00:00.000Z',
                        income_total: '12345678.00',
                        expense_total: '100.00',
                        net_cashflow: '12345578.00',
                    },
                })
            }),
        )
        expect(
            (await fetchDashboardSummary({ period: 'monthly', value: '2026-10' }))
                .income_total,
        ).toBe('12345678.00')
    })
    it('sends the inclusive end_value for a chosen range', async () => {
        server.use(
            http.get('*/dashboard/summary', ({ request }) => {
                const params = new URL(request.url).searchParams
                expect(Object.fromEntries(params)).toEqual({
                    period: 'daily',
                    value: '2024-02-29',
                    end_value: '2024-03-02',
                })
                return HttpResponse.json({
                    data: {
                        period: 'daily',
                        value: '2024-02-29',
                        end_value: '2024-03-02',
                        timezone: 'Asia/Jakarta',
                        start_at: '2024-02-28T17:00:00.000Z',
                        end_at: '2024-03-02T17:00:00.000Z',
                        income_total: '100.00',
                        expense_total: '20.00',
                        net_cashflow: '80.00',
                    },
                })
            }),
        )
        expect(
            (
                await fetchDashboardSummary({
                    period: 'daily',
                    value: '2024-02-29',
                    end_value: '2024-03-02',
                })
            ).end_value,
        ).toBe('2024-03-02')
    })
    it('rejects malformed totals', async () => {
        server.use(
            http.get('*/dashboard/summary', () =>
                HttpResponse.json({ data: { income_total: 123 } }),
            ),
        )
        await expect(
            fetchDashboardSummary({ period: 'yearly', value: '2026' }),
        ).rejects.toThrow()
    })
})
