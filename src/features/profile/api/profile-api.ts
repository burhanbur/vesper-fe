import { apiClient } from '@/lib/api-client'
import type { ApiResponse } from '@/types/api'
import type {
  DeviceDto,
  NotificationDto,
  PatchProfileInput,
  ProfileDto,
} from '../types/profile'

export async function fetchProfile(): Promise<ProfileDto> {
  const response = await apiClient.get<ApiResponse<ProfileDto>>('/me')
  return response.data.data
}

export async function updateProfile(
  input: PatchProfileInput,
): Promise<ProfileDto> {
  const response = await apiClient.patch<ApiResponse<ProfileDto>>('/me', input)
  return response.data.data
}

export async function fetchDevices(): Promise<DeviceDto[]> {
  const response = await apiClient.get<ApiResponse<DeviceDto[]>>('/devices')
  return response.data.data
}

export async function fetchNotifications(): Promise<NotificationDto[]> {
  const response =
    await apiClient.get<ApiResponse<NotificationDto[]>>('/notifications')
  return response.data.data
}

export async function markNotificationRead(id: string): Promise<void> {
  await apiClient.patch(`/notifications/${id}/read`)
}
