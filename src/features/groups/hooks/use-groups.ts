import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createGroup,
  createGroupCategory,
  deleteGroupCategory,
  fetchGroupCategories,
  fetchGroupCategoryMappings,
  fetchGroupCollaboration,
  fetchGroupMembers,
  fetchGroupReport,
  fetchGroups,
  fetchSharedAccounts,
  joinGroup,
  manageGroupMembership,
  mapCategoryToGroupCategory,
  shareAccountWithGroup,
  unmapCategoryFromGroupCategory,
  unshareAccountFromGroup,
} from '../api/group-api'
import type {
  CreateGroupCategoryInput,
  CreateGroupInput,
  MembershipActionInput,
} from '../types/group'

export const groupKeys = {
  all: ['groups'] as const,
  members: (id: string) => [...groupKeys.all, 'members', id] as const,
  collaboration: (id: string, period: string, page = 1) =>
    [...groupKeys.all, 'collaboration', id, period, page] as const,
  accounts: (id: string) => [...groupKeys.all, 'accounts', id] as const,
  categories: (id: string) => [...groupKeys.all, 'categories', id] as const,
  categoryMappings: (id: string) =>
    [...groupKeys.all, 'category-mappings', id] as const,
  report: (id: string, period: string) =>
    [...groupKeys.all, 'report', id, period] as const,
}

export function useGroups() {
  return useQuery({
    queryKey: groupKeys.all,
    queryFn: fetchGroups,
  })
}

export function useGroupMembers(groupId: string) {
  return useQuery({
    queryKey: groupKeys.members(groupId),
    queryFn: () => fetchGroupMembers(groupId),
    enabled: Boolean(groupId),
  })
}

export function useGroupCollaboration(
  groupId: string,
  period: string,
  page = 1,
) {
  return useQuery({
    queryKey: groupKeys.collaboration(groupId, period, page),
    queryFn: () => fetchGroupCollaboration(groupId, period, page),
    enabled: Boolean(groupId && period),
  })
}

export function useSharedAccounts(groupId: string) {
  return useQuery({
    queryKey: groupKeys.accounts(groupId),
    queryFn: () => fetchSharedAccounts(groupId),
    enabled: Boolean(groupId),
  })
}

export function useGroupCategories(groupId: string) {
  return useQuery({
    queryKey: groupKeys.categories(groupId),
    queryFn: () => fetchGroupCategories(groupId),
    enabled: Boolean(groupId),
  })
}

export function useGroupCategoryMappings(groupId: string) {
  return useQuery({
    queryKey: groupKeys.categoryMappings(groupId),
    queryFn: () => fetchGroupCategoryMappings(groupId),
    enabled: Boolean(groupId),
  })
}

export function useGroupReport(groupId: string, period: string) {
  return useQuery({
    queryKey: groupKeys.report(groupId, period),
    queryFn: () => fetchGroupReport(groupId, period),
    enabled: Boolean(groupId && period),
  })
}

export function useCreateGroup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateGroupInput) => createGroup(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: groupKeys.all })
    },
  })
}

export function useJoinGroup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ code, groupId }: { code: string; groupId?: string }) =>
      joinGroup(code, groupId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: groupKeys.all })
    },
  })
}

export function useManageGroupMembership() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      groupId,
      input,
    }: {
      groupId: string
      input: MembershipActionInput
    }) => manageGroupMembership(groupId, input),
    onSuccess: (_, { groupId }) => {
      void queryClient.invalidateQueries({ queryKey: groupKeys.all })
      void queryClient.invalidateQueries({
        queryKey: groupKeys.members(groupId),
      })
      void queryClient.invalidateQueries({
        queryKey: [...groupKeys.all, 'collaboration', groupId],
      })
    },
  })
}

export function useShareAccountWithGroup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      groupId,
      accountId,
    }: {
      groupId: string
      accountId: string
    }) => shareAccountWithGroup(groupId, accountId),
    onSuccess: (_, { groupId }) => {
      void queryClient.invalidateQueries({
        queryKey: groupKeys.accounts(groupId),
      })
      void queryClient.invalidateQueries({
        queryKey: [...groupKeys.all, 'collaboration', groupId],
      })
    },
  })
}

export function useUnshareAccountFromGroup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      groupId,
      accountId,
    }: {
      groupId: string
      accountId: string
    }) => unshareAccountFromGroup(groupId, accountId),
    onSuccess: (_, { groupId }) => {
      void queryClient.invalidateQueries({
        queryKey: groupKeys.accounts(groupId),
      })
      void queryClient.invalidateQueries({
        queryKey: [...groupKeys.all, 'collaboration', groupId],
      })
    },
  })
}

export function useCreateGroupCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      groupId,
      input,
    }: {
      groupId: string
      input: CreateGroupCategoryInput
    }) => createGroupCategory(groupId, input),
    onSuccess: (_, { groupId }) => {
      void queryClient.invalidateQueries({
        queryKey: groupKeys.categories(groupId),
      })
    },
  })
}

export function useDeleteGroupCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      groupId,
      groupCategoryId,
    }: {
      groupId: string
      groupCategoryId: string
    }) => deleteGroupCategory(groupId, groupCategoryId),
    onSuccess: (_, { groupId }) => {
      void queryClient.invalidateQueries({
        queryKey: groupKeys.categories(groupId),
      })
      void queryClient.invalidateQueries({
        queryKey: groupKeys.categoryMappings(groupId),
      })
      void queryClient.invalidateQueries({
        queryKey: [...groupKeys.all, 'report', groupId],
      })
    },
  })
}

export function useMapCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      groupId,
      groupCategoryId,
      userCategoryId,
    }: {
      groupId: string
      groupCategoryId: string
      userCategoryId: string
    }) => mapCategoryToGroupCategory(groupId, groupCategoryId, userCategoryId),
    onSuccess: (_, { groupId }) => {
      void queryClient.invalidateQueries({
        queryKey: groupKeys.categoryMappings(groupId),
      })
      void queryClient.invalidateQueries({
        queryKey: [...groupKeys.all, 'report', groupId],
      })
      void queryClient.invalidateQueries({
        queryKey: [...groupKeys.all, 'collaboration', groupId],
      })
    },
  })
}

export function useUnmapCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      groupId,
      groupCategoryId,
      userCategoryId,
    }: {
      groupId: string
      groupCategoryId: string
      userCategoryId: string
    }) =>
      unmapCategoryFromGroupCategory(groupId, groupCategoryId, userCategoryId),
    onSuccess: (_, { groupId }) => {
      void queryClient.invalidateQueries({
        queryKey: groupKeys.categoryMappings(groupId),
      })
      void queryClient.invalidateQueries({
        queryKey: [...groupKeys.all, 'report', groupId],
      })
      void queryClient.invalidateQueries({
        queryKey: [...groupKeys.all, 'collaboration', groupId],
      })
    },
  })
}
