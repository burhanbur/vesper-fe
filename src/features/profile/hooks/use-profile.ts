import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchDevices,
  fetchNotifications,
  fetchProfile,
  markNotificationRead,
  updateProfile,
} from '../api/profile-api'
import type { PatchProfileInput } from '../types/profile'

export const profileKeys = {
  me: ['profile', 'me'] as const,
  devices: ['devices'] as const,
  notifications: ['notifications'] as const,
}

export function useProfile() {
  return useQuery({
    queryKey: profileKeys.me,
    queryFn: fetchProfile,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: PatchProfileInput) => updateProfile(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: profileKeys.me })
    },
  })
}

export function useDevices() {
  return useQuery({
    queryKey: profileKeys.devices,
    queryFn: fetchDevices,
  })
}

export function useNotifications() {
  return useQuery({
    queryKey: profileKeys.notifications,
    queryFn: fetchNotifications,
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: profileKeys.notifications,
      })
    },
  })
}
