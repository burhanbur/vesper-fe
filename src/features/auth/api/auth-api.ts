import axios from 'axios'
import { env } from '@/config/env'
import {
  authResponseSchema,
  type AuthPayload,
  type LoginFormInput,
  type RegisterFormInput,
} from '@/features/auth/schemas/auth.schema'

const authClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 15_000,
  headers: { Accept: 'application/json' },
})

function parseAuthResponse(responseData: unknown): AuthPayload {
  return authResponseSchema.parse(responseData).data
}

export async function loginRequest(input: LoginFormInput) {
  const identifier = input.identifier.trim().toLowerCase()
  const credential = identifier.includes('@')
    ? { email: identifier }
    : { username: identifier }
  const response = await authClient.post('/auth/login', {
    ...credential,
    password: input.password,
  })

  return parseAuthResponse(response.data)
}

export async function registerRequest(input: RegisterFormInput) {
  const payload: Record<string, string> = {
    name: input.name,
    email: input.email,
    password: input.password,
  }
  if (input.username && input.username.trim().length > 0) {
    payload.username = input.username.trim()
  }

  const response = await authClient.post('/auth/register', payload)
  return parseAuthResponse(response.data)
}

export async function refreshRequest(refreshToken: string) {
  const response = await authClient.post('/auth/refresh', {
    refresh_token: refreshToken,
  })

  return parseAuthResponse(response.data)
}

export async function logoutRequest(accessToken: string) {
  await authClient.post('/auth/logout', undefined, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
}
