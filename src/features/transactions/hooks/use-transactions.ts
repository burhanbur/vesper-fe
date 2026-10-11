import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { accountKeys } from '@/features/accounts/hooks/use-accounts'
import {
  createTransaction,
  createTransfer,
  deleteTransaction,
  fetchTransactions,
  updateTransaction,
} from '../api/transaction-api'
import type {
  CreateTransactionInput,
  CreateTransferInput,
  ListTransactionsQuery,
  UpdateTransactionInput,
} from '../types/transaction'

export const transactionKeys = {
  all: ['transactions'] as const,
  list: (query?: ListTransactionsQuery) =>
    [...transactionKeys.all, query] as const,
}

export function useTransactions(query?: ListTransactionsQuery) {
  return useQuery({
    queryKey: transactionKeys.list(query),
    queryFn: () => fetchTransactions(query),
  })
}

export function useCreateTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateTransactionInput) => createTransaction(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: transactionKeys.all })
      void queryClient.invalidateQueries({ queryKey: accountKeys.all })
    },
  })
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string
      input: UpdateTransactionInput
    }) => updateTransaction(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: transactionKeys.all })
      void queryClient.invalidateQueries({ queryKey: accountKeys.all })
    },
  })
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, version }: { id: string; version: string }) =>
      deleteTransaction(id, version),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: transactionKeys.all })
      void queryClient.invalidateQueries({ queryKey: accountKeys.all })
    },
  })
}

export function useCreateTransfer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateTransferInput) => createTransfer(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: transactionKeys.all })
      void queryClient.invalidateQueries({ queryKey: accountKeys.all })
    },
  })
}
