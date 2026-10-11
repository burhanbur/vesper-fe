import { describe, expect, it } from 'vitest'
import { authResponseSchema, loginFormSchema } from './auth.schema'

describe('loginFormSchema', () => {
  it('trims a valid identifier', () => {
    const result = loginFormSchema.parse({
      identifier: '  developer@example.com  ',
      password: 'secret-password',
    })

    expect(result.identifier).toBe('developer@example.com')
  })

  it('rejects empty credentials', () => {
    const result = loginFormSchema.safeParse({ identifier: ' ', password: '' })

    expect(result.success).toBe(false)
  })
})

describe('authResponseSchema', () => {
  it('accepts the backend authentication contract', () => {
    const result = authResponseSchema.safeParse({
      success: true,
      message: 'Signed in.',
      timestamp: '2026-01-01T00:00:00.000Z',
      data: {
        user: {
          id: '8b5cc5c2-267b-4e5f-a9aa-f6abc550c820',
          name: 'Starter User',
          email: 'starter@example.com',
          status: 'ACTIVE',
          roles: ['USER'],
        },
        access_token: 'access-jwt',
        refresh_token: 'refresh-jwt',
        token_type: 'Bearer',
        expires_at: '2026-01-01T00:15:00.000Z',
        refresh_expires_at: '2026-01-08T00:00:00.000Z',
      },
    })

    expect(result.success).toBe(true)
  })
})
