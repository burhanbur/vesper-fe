import { apiClient } from '@/lib/api-client'
import type { ApiResponse } from '@/types/api'
import type {
  CategoryDto,
  CategoryType,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '../types/category'

export async function fetchCategories(params?: {
  type?: CategoryType
  account_id?: string
}): Promise<CategoryDto[]> {
  const response = await apiClient.get<ApiResponse<CategoryDto[]>>(
    '/categories',
    {
      params: { limit: 100, ...params },
    },
  )
  return response.data.data
}

export async function createCategory(
  input: CreateCategoryInput,
): Promise<CategoryDto> {
  const response = await apiClient.post<ApiResponse<CategoryDto>>(
    '/categories',
    input,
  )
  return response.data.data
}

export async function updateCategory(
  id: string,
  input: UpdateCategoryInput,
): Promise<CategoryDto> {
  const response = await apiClient.patch<ApiResponse<CategoryDto>>(
    `/categories/${id}`,
    input,
  )
  return response.data.data
}

export async function deleteCategory(
  id: string,
  version: string,
): Promise<void> {
  await apiClient.delete(`/categories/${id}`, {
    params: { version },
  })
}
