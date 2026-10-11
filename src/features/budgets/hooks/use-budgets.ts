import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createBudget,
  deleteBudget,
  fetchBudgetProgress,
  fetchBudgets,
  updateBudget,
} from '../api/budget-api'
import type {
  CreateBudgetInput,
  PeriodType,
  UpdateBudgetInput,
} from '../types/budget'

export const budgetKeys = {
  all: ['budgets'] as const,
  list: (params?: { category_id?: string; period_type?: PeriodType }) =>
    [...budgetKeys.all, params] as const,
  progress: (id: string, period: string) =>
    [...budgetKeys.all, 'progress', id, period] as const,
}

export function useBudgets(params?: {
  category_id?: string
  period_type?: PeriodType
}) {
  return useQuery({
    queryKey: budgetKeys.list(params),
    queryFn: () => fetchBudgets(params),
  })
}

export function useBudgetProgress(id: string, period: string) {
  return useQuery({
    queryKey: budgetKeys.progress(id, period),
    queryFn: () => fetchBudgetProgress(id, period),
    enabled: Boolean(id && period),
  })
}

export function useCreateBudget() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateBudgetInput) => createBudget(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: budgetKeys.all })
    },
  })
}

export function useUpdateBudget() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateBudgetInput }) =>
      updateBudget(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: budgetKeys.all })
    },
  })
}

export function useDeleteBudget() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteBudget(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: budgetKeys.all })
    },
  })
}
