import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createAccount,
  createAccountType,
  deleteAccount,
  fetchAccounts,
  fetchAccountTypes,
  updateAccount,
} from '../api/account-api'
import type {
  CreateAccountInput,
  CreateAccountTypeInput,
  UpdateAccountInput,
} from '../types/account'

export const accountKeys = {
  all: ['accounts'] as const,
  lists: () => [...accountKeys.all, 'list'] as const,
  list: (params?: Record<string, unknown>) =>
    [...accountKeys.lists(), params] as const,
  types: () => ['account-types'] as const,
}

export function useAccounts(params?: {
  parent_account_id?: string
  is_visible?: 'true' | 'false'
}) {
  return useQuery({
    queryKey: accountKeys.list(params),
    queryFn: () => fetchAccounts(params),
  })
}

export function useAccountTypes() {
  return useQuery({
    queryKey: accountKeys.types(),
    queryFn: fetchAccountTypes,
  })
}

export function useCreateAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateAccountInput) => createAccount(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: accountKeys.all })
    },
  })
}

export function useUpdateAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateAccountInput }) =>
      updateAccount(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: accountKeys.all })
    },
  })
}

export function useDeleteAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, version }: { id: string; version: string }) =>
      deleteAccount(id, version),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: accountKeys.all })
    },
  })
}

export function useCreateAccountType() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateAccountTypeInput) => createAccountType(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: accountKeys.types() })
    },
  })
}
