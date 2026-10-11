import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createCategory,
  deleteCategory,
  fetchCategories,
  updateCategory,
} from '../api/category-api'
import type {
  CategoryType,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '../types/category'

export const categoryKeys = {
  all: ['categories'] as const,
  list: (params?: { type?: CategoryType; account_id?: string }) =>
    [...categoryKeys.all, params] as const,
}

export function useCategories(params?: {
  type?: CategoryType
  account_id?: string
}) {
  return useQuery({
    queryKey: categoryKeys.list(params),
    queryFn: () => fetchCategories(params),
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateCategoryInput) => createCategory(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: categoryKeys.all })
    },
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCategoryInput }) =>
      updateCategory(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: categoryKeys.all })
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, version }: { id: string; version: string }) =>
      deleteCategory(id, version),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: categoryKeys.all })
    },
  })
}
