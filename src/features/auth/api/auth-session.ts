import type {
  AuthPayload,
  AuthUser,
  LoginFormInput,
  RegisterFormInput,
} from '@/features/auth/schemas/auth.schema'
import { normalizeApiError } from '@/lib/api-error'
import { queryClient } from '@/lib/query-client'
import {
  loginRequest,
  logoutRequest,
  refreshRequest,
  registerRequest,
} from './auth-api'
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
  subscribeToTokenChanges,
  withRefreshLock,
} from './auth-token-store'

export type AuthStatus = 'restoring' | 'authenticated' | 'anonymous'

type AuthSnapshot = {
  status: AuthStatus
  user: AuthUser | null
}

let snapshot: AuthSnapshot = {
  status: getRefreshToken() ? 'restoring' : 'anonymous',
  user: null,
}
let refreshPromise: Promise<AuthPayload> | null = null
const listeners = new Set<() => void>()

function emit(nextSnapshot: AuthSnapshot) {
  snapshot = nextSnapshot
  listeners.forEach((listener) => listener())
}

function applyPayload(payload: AuthPayload) {
  setTokens({
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token,
  })
  emit({ status: 'authenticated', user: payload.user })
}

function clearSession() {
  clearTokens()
  queryClient.clear()
  emit({ status: 'anonymous', user: null })
}

subscribeToTokenChanges(() => {
  if (!getRefreshToken() && snapshot.status !== 'anonymous') {
    queryClient.clear()
    emit({ status: 'anonymous', user: null })
  }
})

const getSnapshot = () => snapshot

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

const refresh = async (): Promise<AuthPayload> => {
  if (refreshPromise) return refreshPromise

  refreshPromise = withRefreshLock(async () => {
    const refreshToken = getRefreshToken()
    if (!refreshToken) {
      throw new Error('No refresh token is available.')
    }

    try {
      const payload = await refreshRequest(refreshToken)
      applyPayload(payload)
      return payload
    } catch (error) {
      clearSession()
      throw normalizeApiError(error)
    }
  }).finally(() => {
    refreshPromise = null
  })

  return refreshPromise
}

const restore = async () => {
  if (!getRefreshToken()) {
    emit({ status: 'anonymous', user: null })
    return
  }

  emit({ status: 'restoring', user: null })
  try {
    await refresh()
  } catch {
    clearSession()
  }
}

const login = async (input: LoginFormInput) => {
  try {
    const payload = await loginRequest(input)
    applyPayload(payload)
    return payload.user
  } catch (error) {
    throw normalizeApiError(error)
  }
}

const register = async (input: RegisterFormInput) => {
  try {
    const payload = await registerRequest(input)
    applyPayload(payload)
    return payload.user
  } catch (error) {
    throw normalizeApiError(error)
  }
}

const logout = async () => {
  const accessToken = getAccessToken()
  try {
    if (accessToken) await logoutRequest(accessToken)
  } finally {
    clearSession()
  }
}

export const authSession = {
  getSnapshot,
  subscribe,
  restore,
  login,
  register,
  refresh,
  logout,
  clear: clearSession,
}
