import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createApiKey,
  deleteApiKey,
  fetchApiKeys,
  updateApiKey,
} from '../api/api-key-api'
import type {
  CreateApiKeyInput,
  ListApiKeysParams,
  UpdateApiKeyInput,
} from '../types/api-key'

export const apiKeyKeys = {
  all: ['api-keys'] as const,
  list: (params?: ListApiKeysParams) => [...apiKeyKeys.all, params] as const,
}

export function useApiKeys(params?: ListApiKeysParams) {
  return useQuery({
    queryKey: apiKeyKeys.list(params),
    queryFn: () => fetchApiKeys(params),
  })
}

export function useCreateApiKey() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateApiKeyInput) => createApiKey(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: apiKeyKeys.all })
    },
  })
}

export function useUpdateApiKey() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateApiKeyInput }) =>
      updateApiKey(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: apiKeyKeys.all })
    },
  })
}

export function useDeleteApiKey() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteApiKey(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: apiKeyKeys.all })
    },
  })
}
