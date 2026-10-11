import { beforeEach, describe, expect, it } from 'vitest'
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from './auth-token-store'

const REFRESH_TOKEN_KEY = 'react-starter-kit.refresh-token'

describe('auth token store', () => {
  beforeEach(() => {
    clearTokens()
    localStorage.clear()
  })

  it('keeps the access token in memory and persists only the refresh token', () => {
    setTokens({ accessToken: 'access-jwt', refreshToken: 'refresh-jwt' })

    expect(getAccessToken()).toBe('access-jwt')
    expect(getRefreshToken()).toBe('refresh-jwt')
    expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBe('refresh-jwt')
    expect(Object.values(localStorage)).not.toContain('access-jwt')
  })

  it('clears both tokens when the session ends', () => {
    setTokens({ accessToken: 'access-jwt', refreshToken: 'refresh-jwt' })

    clearTokens()

    expect(getAccessToken()).toBeNull()
    expect(getRefreshToken()).toBeNull()
  })
})
