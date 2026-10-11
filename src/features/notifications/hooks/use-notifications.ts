import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchNotifications,
  markNotificationAsRead,
} from '../api/notification-api'
import type { ListNotificationsParams } from '../types/notification'

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (params?: ListNotificationsParams) =>
    [...notificationKeys.all, params] as const,
}

export function useNotifications(params?: ListNotificationsParams) {
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => fetchNotifications(params),
    refetchInterval: 30000, // auto poll every 30s for real-time updates
  })
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => markNotificationAsRead(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}
