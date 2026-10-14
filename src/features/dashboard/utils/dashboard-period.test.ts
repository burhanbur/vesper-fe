import { describe, expect, it, vi } from 'vitest'
import {
    currentPeriodValue,
    dashboardPeriodRange,
    dashboardSearchSchema,
    normalizeDashboardSearch,
    dashboardPeriodLabel,
} from './dashboard-period'

describe('dashboard WIB periods', () => {
    it('defaults to the WIB month across a UTC month boundary', () => {
        vi.useFakeTimers()
        vi.setSystemTime(new Date('2026-10-31T17:00:00Z'))
        expect(normalizeDashboardSearch({})).toEqual({
            period: 'monthly',
            value: '2026-11',
            end_value: '2026-11',
        })
        expect(currentPeriodValue('daily')).toBe('2026-11-01')
        vi.useRealTimers()
    })
    it.each([
        [
            'daily',
            '2024-02-29',
            '2024-02-28T17:00:00.000Z',
            '2024-02-29T17:00:00.000Z',
        ],
        [
            'monthly',
            '2026-12',
            '2026-11-30T17:00:00.000Z',
            '2026-12-31T17:00:00.000Z',
        ],
        ['yearly', '2026', '2025-12-31T17:00:00.000Z', '2026-12-31T17:00:00.000Z'],
    ])(
        'computes %s start-inclusive/end-exclusive boundaries',
        (period, value, startAt, endAt) => {
            const search = dashboardSearchSchema.parse({ period, value })
            const range = dashboardPeriodRange(search)
            expect(range.startAt).toBe(startAt)
            expect(range.endAt).toBe(endAt)
            expect(range.dateRange).toBe(
                `${startAt},${new Date(Date.parse(endAt) - 1).toISOString()}`,
            )
        },
    )
    it.each([
        { period: 'daily', value: '2026-02-29' },
        { period: 'monthly', value: '2026-13' },
        { period: 'yearly', value: '0999' },
        { period: 'yearly', value: '9999' },
        { period: 'daily', value: '2026-10' },
        { period: 'weekly', value: '2026' },
    ])('rejects invalid URL values: %j', (search) => {
        expect(dashboardSearchSchema.safeParse(search).success).toBe(false)
        expect(normalizeDashboardSearch(search).period).toBe('monthly')
    })
    it.each([
        [
            'daily',
            '2024-02-28',
            '2024-03-01',
            '2024-02-27T17:00:00.000Z',
            '2024-03-01T17:00:00.000Z',
        ],
        [
            'monthly',
            '2026-10',
            '2027-01',
            '2026-09-30T17:00:00.000Z',
            '2027-01-31T17:00:00.000Z',
        ],
        [
            'yearly',
            '2024',
            '2026',
            '2023-12-31T17:00:00.000Z',
            '2026-12-31T17:00:00.000Z',
        ],
    ])(
        'includes the entire ending %s period',
        (period, value, end_value, startAt, endAt) => {
            const range = dashboardPeriodRange(
                dashboardSearchSchema.parse({ period, value, end_value }),
            )
            expect(range).toEqual({
                startAt,
                endAt,
                dateRange: `${startAt},${new Date(Date.parse(endAt) - 1).toISOString()}`,
            })
        },
    )
    it.each([
        { period: 'daily', value: '2024-02-28', end_value: '2024-02-30' },
        { period: 'daily', value: '2026-02-28', end_value: '2026-02-29' },
        { period: 'monthly', value: '2026-10', end_value: '2026-09' },
        { period: 'yearly', value: '2026', end_value: '2025' },
        { period: 'monthly', value: '2026-10', end_value: '' },
    ])('rejects invalid range endpoints: %j', (search) => {
        expect(dashboardSearchSchema.safeParse(search).success).toBe(false)
    })
    it('round trips both URL endpoints and resolves legacy URLs', () => {
        const search = {
            period: 'daily',
            value: '2024-02-29',
            end_value: '2024-03-02',
        } as const
        const params = new URLSearchParams(search)
        expect(normalizeDashboardSearch(Object.fromEntries(params))).toEqual(search)
        expect(
            normalizeDashboardSearch({ period: 'monthly', value: '2026-10' }),
        ).toEqual({ period: 'monthly', value: '2026-10', end_value: '2026-10' })
        expect(dashboardPeriodLabel(search)).toBe('29 Februari 2024 – 2 Maret 2024')
        expect(dashboardPeriodLabel({ period: 'monthly', value: '2026-10' })).toBe(
            'Oktober 2026',
        )
    })
    it('accepts supported extreme years', () => {
        expect(
            dashboardPeriodRange({ period: 'yearly', value: '1000' }).startAt,
        ).toBe('0999-12-31T17:00:00.000Z')
        expect(
            dashboardPeriodRange({ period: 'yearly', value: '9998' }).endAt,
        ).toBe('9998-12-31T17:00:00.000Z')
    })
})
