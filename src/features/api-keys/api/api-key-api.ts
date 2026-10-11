import { apiClient } from '@/lib/api-client'
import type { ApiResponse } from '@/types/api'
import type {
  ApiKeyCreatedDto,
  ApiKeyDto,
  CreateApiKeyInput,
  ListApiKeysParams,
  UpdateApiKeyInput,
} from '../types/api-key'

export async function fetchApiKeys(
  params?: ListApiKeysParams,
): Promise<ApiKeyDto[]> {
  const response = await apiClient.get<ApiResponse<ApiKeyDto[]>>('/api-keys', {
    params: { limit: 100, ...params },
  })
  return response.data.data
}

export async function createApiKey(
  input: CreateApiKeyInput,
): Promise<ApiKeyCreatedDto> {
  const response = await apiClient.post<ApiResponse<ApiKeyCreatedDto>>(
    '/api-keys',
    input,
  )
  return response.data.data
}

export async function updateApiKey(
  id: string,
  input: UpdateApiKeyInput,
): Promise<ApiKeyDto> {
  const response = await apiClient.patch<ApiResponse<ApiKeyDto>>(
    `/api-keys/${id}`,
    input,
  )
  return response.data.data
}

export async function deleteApiKey(id: string): Promise<void> {
  await apiClient.delete(`/api-keys/${id}`)
}
