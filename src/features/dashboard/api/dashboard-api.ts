import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { apiClient } from '@/lib/api-client'
import type { ApiResponse } from '@/types/api'
import {
    dashboardPeriodSchema,
    dashboardSearchSchema,
    type DashboardSearch,
} from '../utils/dashboard-period'

const moneySchema = z.string().regex(/^-?\d+\.\d{2}$/)
export const dashboardSummarySchema = z
    .object({
        period: dashboardPeriodSchema,
        value: z.string(),
        end_value: z.string(),
        timezone: z.literal('Asia/Jakarta'),
        start_at: z.string().datetime(),
        end_at: z.string().datetime(),
        income_total: moneySchema,
        expense_total: moneySchema,
        net_cashflow: moneySchema,
    })
    .strict()

export const dashboardKeys = {
    all: ['dashboard'] as const,
    summary: (search: DashboardSearch) =>
        ['dashboard', 'summary', dashboardSearchSchema.parse(search)] as const,
}

export async function fetchDashboardSummary(search: DashboardSearch) {
    const params = dashboardSearchSchema.parse(search)
    const response = await apiClient.get<ApiResponse<unknown>>(
        '/dashboard/summary',
        { params },
    )
    return dashboardSummarySchema.parse(response.data.data)
}

export function useDashboardSummary(search: DashboardSearch) {
    return useQuery({
        queryKey: dashboardKeys.summary(search),
        queryFn: () => fetchDashboardSummary(search),
        staleTime: 30_000,
        retry: false,
    })
}
