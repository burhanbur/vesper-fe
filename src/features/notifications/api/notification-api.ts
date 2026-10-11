import { apiClient } from '@/lib/api-client'
import type { ApiResponse } from '@/types/api'
import type {
  ListNotificationsParams,
  NotificationDto,
} from '../types/notification'

export async function fetchNotifications(
  params?: ListNotificationsParams,
): Promise<NotificationDto[]> {
  const response = await apiClient.get<ApiResponse<NotificationDto[]>>(
    '/notifications',
    {
      params: { limit: 20, sort: '-created_at', ...params },
    },
  )
  return response.data.data
}

export async function markNotificationAsRead(
  id: string,
): Promise<NotificationDto> {
  const response = await apiClient.patch<ApiResponse<NotificationDto>>(
    `/notifications/${id}/read`,
  )
  return response.data.data
}
