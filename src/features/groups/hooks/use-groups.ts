import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createGroup,
  fetchGroupMembers,
  fetchGroupReport,
  fetchGroups,
  joinGroup,
  shareAccountWithGroup,
} from '../api/group-api'
import type { CreateGroupInput, JoinGroupInput } from '../types/group'

export const groupKeys = {
  all: ['groups'] as const,
  members: (id: string) => [...groupKeys.all, 'members', id] as const,
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
    mutationFn: ({
      groupId,
      input,
    }: {
      groupId: string
      input: JoinGroupInput
    }) => joinGroup(groupId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: groupKeys.all })
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
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: groupKeys.all })
    },
  })
}
