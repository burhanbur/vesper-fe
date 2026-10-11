export interface ApiKeyDto {
  id: string
  name: string
  description: string | null
  application: string | null
  key_prefix: string
  ip_whitelist: string[] | null
  permissions: string[] | null
  is_active: boolean
  rate_limit: number
  last_used_at: string | null
  expires_at: string | null
  created_at: string
  updated_at: string
}

export interface ApiKeyCreatedDto extends ApiKeyDto {
  key: string
}

export interface CreateApiKeyInput {
  name: string
  description?: string | null
  application?: string | null
  ip_whitelist?: string[] | null
  permissions?: string[] | null
  rate_limit?: number
  expires_at?: string | null
}

export interface UpdateApiKeyInput {
  name?: string
  description?: string | null
  is_active?: boolean
  rate_limit?: number
  expires_at?: string | null
}

export interface ListApiKeysParams {
  page?: number
  limit?: number
  is_active?: boolean
  search?: string
}
