import { apiClient } from '@/lib/api-client'
import { accountCardMetadataSchema } from '../schemas/account-schema'

export function parseAccount(account: AccountDto): AccountDto {
  return { ...account, ...accountCardMetadataSchema.parse(account) }
}
import type { ApiResponse } from '@/types/api'
import type {
  AccountDto,
  AccountTypeDto,
  CreateAccountInput,
  CreateAccountTypeInput,
  UpdateAccountInput,
} from '../types/account'

export async function fetchAccounts(params?: {
  parent_account_id?: string
  is_visible?: 'true' | 'false'
  limit?: number
}): Promise<AccountDto[]> {
  const response = await apiClient.get<ApiResponse<AccountDto[]>>('/accounts', {
    params: { limit: 100, ...params },
  })
  return response.data.data.map(parseAccount)
}

export async function fetchAccountTypes(): Promise<AccountTypeDto[]> {
  const response = await apiClient.get<ApiResponse<AccountTypeDto[]>>(
    '/account-types',
    {
      params: { limit: 100 },
    },
  )
  return response.data.data
}

export async function createAccount(
  input: CreateAccountInput,
): Promise<AccountDto> {
  const response = await apiClient.post<ApiResponse<AccountDto>>(
    '/accounts',
    input,
  )
  return parseAccount(response.data.data)
}

export async function updateAccount(
  id: string,
  input: UpdateAccountInput,
): Promise<AccountDto> {
  const response = await apiClient.patch<ApiResponse<AccountDto>>(
    `/accounts/${id}`,
    input,
  )
  return parseAccount(response.data.data)
}

export async function deleteAccount(
  id: string,
  version: string,
): Promise<void> {
  await apiClient.delete(`/accounts/${id}`, {
    params: { version },
  })
}

export async function createAccountType(
  input: CreateAccountTypeInput,
): Promise<AccountTypeDto> {
  const response = await apiClient.post<ApiResponse<AccountTypeDto>>(
    '/account-types',
    input,
  )
  return response.data.data
}
