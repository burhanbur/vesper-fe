export type NotificationType = 'info' | 'error' | 'warning'

export interface NotificationDto {
  id: string
  user_id: string
  type: NotificationType
  title: string
  body: string
  metadata: Record<string, unknown> | null
  is_read: boolean
  read_at: string | null
  created_at: string
  updated_at: string
}

export interface ListNotificationsParams {
  page?: number
  limit?: number
  sort?: 'created_at' | '-created_at'
  is_read?: 'true' | 'false'
  type?: NotificationType
}
