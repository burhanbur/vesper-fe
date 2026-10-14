import type { SearchSchemaInput } from '@tanstack/react-router'
import { z } from 'zod'

const WIB_OFFSET_MS = 7 * 60 * 60 * 1000
export const dashboardPeriodSchema = z.enum(['daily', 'monthly', 'yearly'])
export type DashboardPeriod = z.infer<typeof dashboardPeriodSchema>

function calendarStart(period: DashboardPeriod, value: string) {
    const pattern = {
        daily: /^\d{4}-\d{2}-\d{2}$/,
        monthly: /^\d{4}-\d{2}$/,
        yearly: /^\d{4}$/,
    }[period]
    if (!pattern.test(value)) return undefined
    const [year = 0, month = 1, day = 1] = value.split('-').map(Number)
    if (
        year < 1000 ||
        year > 9998 ||
        month < 1 ||
        month > 12 ||
        day < 1 ||
        day > 31
    )
        return undefined
    const date = new Date(Date.UTC(year, month - 1, day))
    return date.getUTCFullYear() === year &&
        date.getUTCMonth() === month - 1 &&
        date.getUTCDate() === day
        ? date
        : undefined
}

export const dashboardSearchSchema = z
    .object({
        period: dashboardPeriodSchema,
        value: z.string(),
        end_value: z.string().optional(),
    })
    .transform((search) => ({
        ...search,
        end_value: search.end_value ?? search.value,
    }))
    .superRefine(({ period, value, end_value }, context) => {
        const start = calendarStart(period, value)
        const end = calendarStart(period, end_value)
        for (const [path, date] of [
            ['value', start],
            ['end_value', end],
        ] as const) {
            if (!date)
                context.addIssue({
                    code: 'custom',
                    path: [path],
                    message: 'Periode tidak valid. Gunakan tahun 1000–9998.',
                })
        }
        if (start && end && end < start)
            context.addIssue({
                code: 'custom',
                path: ['end_value'],
                message: 'Periode sampai harus sama atau setelah periode dari.',
            })
    })
export type DashboardSearch = z.input<typeof dashboardSearchSchema>

export function currentPeriodValue(period: DashboardPeriod, now = new Date()) {
    const wibDate = new Date(now.getTime() + WIB_OFFSET_MS)
        .toISOString()
        .slice(0, 10)
    return wibDate.slice(0, { daily: 10, monthly: 7, yearly: 4 }[period])
}

/** Invalid or incomplete URL ranges normalize together to the current WIB month. */
export function normalizeDashboardSearch(search: unknown) {
    const parsed = dashboardSearchSchema.safeParse(search)
    return parsed.success
        ? parsed.data
        : dashboardSearchSchema.parse({
            period: 'monthly',
            value: currentPeriodValue('monthly'),
        })
}

export function validateDashboardSearch(
    search: SearchSchemaInput & {
        period?: unknown
        value?: unknown
        end_value?: unknown
    },
): DashboardSearch {
    return normalizeDashboardSearch(search)
}

export function dashboardPeriodLabel(search: DashboardSearch) {
    const validated = dashboardSearchSchema.parse(search)
    const formatter = new Intl.DateTimeFormat('id-ID', {
        timeZone: 'UTC',
        year: 'numeric',
        ...(validated.period !== 'yearly' ? ({ month: 'long' } as const) : {}),
        ...(validated.period === 'daily' ? ({ day: 'numeric' } as const) : {}),
    })
    const format = (value: string) => {
        const date = calendarStart(validated.period, value)
        if (!date) throw new Error('Validated calendar invariant violated')
        return formatter.format(date)
    }
    return validated.value === validated.end_value
        ? format(validated.value)
        : `${format(validated.value)} – ${format(validated.end_value)}`
}

export function dashboardPeriodRange(search: DashboardSearch) {
    const validated = dashboardSearchSchema.parse(search)
    const start = calendarStart(validated.period, validated.value)
    const end = calendarStart(validated.period, validated.end_value)
    if (!start || !end) throw new Error('Validated calendar invariant violated')
    if (validated.period === 'daily') end.setUTCDate(end.getUTCDate() + 1)
    if (validated.period === 'monthly') end.setUTCMonth(end.getUTCMonth() + 1)
    if (validated.period === 'yearly')
        end.setUTCFullYear(end.getUTCFullYear() + 1)
    const startAt = new Date(start.getTime() - WIB_OFFSET_MS).toISOString()
    const endAt = new Date(end.getTime() - WIB_OFFSET_MS).toISOString()
    // Transaction listing uses an inclusive upper bound; summary uses exclusive end.
    const dateRange = `${startAt},${new Date(Date.parse(endAt) - 1).toISOString()}`
    return { startAt, endAt, dateRange }
}
