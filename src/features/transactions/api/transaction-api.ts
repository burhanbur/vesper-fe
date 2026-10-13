import { z } from 'zod'
import { apiClient } from '@/lib/api-client'
import type { ApiResponse } from '@/types/api'
import type {
  CreateTransactionInput,
  CreateTransferInput,
  ListTransactionsQuery,
  TransactionDto,
  TransferDto,
  UpdateTransactionInput,
} from '../types/transaction'

export async function fetchTransactions(
  query?: ListTransactionsQuery,
): Promise<TransactionDto[]> {
  const response = await apiClient.get<ApiResponse<TransactionDto[]>>(
    '/transactions',
    {
      params: { limit: 50, ...query },
    },
  )
  return response.data.data
}

export async function createTransaction(
  input: CreateTransactionInput,
): Promise<TransactionDto> {
  const response = await apiClient.post<ApiResponse<TransactionDto>>(
    '/transactions',
    input,
  )
  return response.data.data
}

export type BatchTransactionInput =
  CreateTransactionInput | (CreateTransferInput & { type: 'TRANSFER' })

const batchResultSchema = z.object({ count: z.number().int().nonnegative() })

export async function createTransactionsBatch(
  items: BatchTransactionInput[],
): Promise<{ count: number }> {
  const response = await apiClient.post<ApiResponse<unknown>>(
    '/transactions/batch',
    { items },
  )
  return batchResultSchema.parse(response.data.data)
}

export async function updateTransaction(
  id: string,
  input: UpdateTransactionInput,
): Promise<TransactionDto> {
  const response = await apiClient.patch<ApiResponse<TransactionDto>>(
    `/transactions/${id}`,
    input,
  )
  return response.data.data
}

export async function deleteTransaction(
  id: string,
  version: string,
): Promise<void> {
  await apiClient.delete(`/transactions/${id}`, {
    params: { version },
  })
}

export async function createTransfer(
  input: CreateTransferInput,
): Promise<TransferDto> {
  const response = await apiClient.post<ApiResponse<TransferDto>>(
    '/transfers',
    input,
  )
  return response.data.data
}
