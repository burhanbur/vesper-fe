import { apiClient } from '@/lib/api-client'
import type { ApiResponse } from '@/types/api'
import type {
  BudgetDto,
  BudgetProgressDto,
  CreateBudgetInput,
  PeriodType,
  UpdateBudgetInput,
} from '../types/budget'

export async function fetchBudgets(params?: {
  category_id?: string
  period_type?: PeriodType
}): Promise<BudgetDto[]> {
  const response = await apiClient.get<ApiResponse<BudgetDto[]>>('/budgets', {
    params: { limit: 100, ...params },
  })
  return response.data.data
}

export async function fetchBudgetProgress(
  id: string,
  period: string,
): Promise<BudgetProgressDto> {
  const response = await apiClient.get<ApiResponse<BudgetProgressDto>>(
    `/budgets/${id}/progress`,
    { params: { period } },
  )
  return response.data.data
}

export async function createBudget(
  input: CreateBudgetInput,
): Promise<BudgetDto> {
  const response = await apiClient.post<ApiResponse<BudgetDto>>(
    '/budgets',
    input,
  )
  return response.data.data
}

export async function updateBudget(
  id: string,
  input: UpdateBudgetInput,
): Promise<BudgetDto> {
  const response = await apiClient.patch<ApiResponse<BudgetDto>>(
    `/budgets/${id}`,
    input,
  )
  return response.data.data
}

export async function deleteBudget(id: string): Promise<void> {
  await apiClient.delete(`/budgets/${id}`)
}
