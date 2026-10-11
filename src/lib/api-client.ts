import axios, { AxiosHeaders, type InternalAxiosRequestConfig } from 'axios'
import { env } from '@/config/env'
import { authSession } from '@/features/auth/api/auth-session'
import { getAccessToken } from '@/features/auth/api/auth-token-store'
import { normalizeApiError } from '@/lib/api-error'

type RetryableRequest = InternalAxiosRequestConfig & { _retry?: boolean }

const AUTH_PATHS = ['/auth/login', '/auth/refresh', '/auth/logout']

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 15_000,
  headers: { Accept: 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  const accessToken = getAccessToken()
  if (accessToken) {
    config.headers = AxiosHeaders.from(config.headers)
    config.headers.set('Authorization', `Bearer ${accessToken}`)
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error) || !error.config) {
      throw normalizeApiError(error)
    }

    const request = error.config as RetryableRequest
    const isAuthPath = AUTH_PATHS.some((path) => request.url?.includes(path))
    if (error.response?.status !== 401 || request._retry || isAuthPath) {
      throw normalizeApiError(error)
    }

    request._retry = true
    try {
      await authSession.refresh()
      return await apiClient.request(request)
    } catch (refreshError) {
      throw normalizeApiError(refreshError)
    }
  },
)
