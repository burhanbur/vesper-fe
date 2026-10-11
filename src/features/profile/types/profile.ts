export interface ProfileDto {
  user_id: string
  full_name: string | null
  phone_number: string | null
  gender: 'Laki-laki' | 'Perempuan' | null
  photo: string | null
  base_currency: string
  theme: 'light' | 'dark' | 'system'
  created_at: string | null
  updated_at: string | null
  deleted_at: string | null
}

export interface PatchProfileInput {
  full_name?: string | null
  phone_number?: string | null
  gender?: 'Laki-laki' | 'Perempuan' | null
  base_currency?: string
  theme?: 'light' | 'dark' | 'system'
}

export interface DeviceDto {
  id: string
  user_id: string
  name: string
  platform: string
  app_version: string
  last_sync_version: string
  last_sync_at: string | null
  last_seen_at: string | null
  created_at: string
  updated_at: string
}

export interface NotificationDto {
  id: string
  user_id: string
  type: 'info' | 'error' | 'warning'
  title: string
  body: string
  metadata: Record<string, unknown> | null
  is_read: boolean
  read_at: string | null
  created_at: string
  updated_at: string
}
