import axios from 'axios'
import { z } from 'zod'

const apiErrorSchema = z.object({
  message: z.string().optional(),
  errors: z.record(z.string(), z.unknown()).optional(),
})

export class ApiError extends Error {
  readonly status: number | undefined
  readonly details: Readonly<Record<string, unknown>> | undefined
  readonly retryAfterMs: number | undefined

  constructor(
    message: string,
    status: number | undefined,
    details?: Readonly<Record<string, unknown>>,
    retryAfterMs?: number,
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
    this.retryAfterMs = retryAfterMs
  }
}

export function normalizeApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error
  if (!axios.isAxiosError(error)) {
    return new ApiError('An unexpected error occurred.', undefined)
  }

  const parsed = apiErrorSchema.safeParse(error.response?.data)
  const retryAfter: unknown = error.response?.headers['retry-after']
  const seconds = typeof retryAfter === 'string' ? Number(retryAfter) : NaN
  const dateDelay =
    typeof retryAfter === 'string' ? Date.parse(retryAfter) - Date.now() : NaN
  const retryAfterMs = Number.isFinite(seconds)
    ? Math.max(1_000, seconds * 1_000)
    : Number.isFinite(dateDelay)
      ? Math.max(1_000, dateDelay)
      : undefined
  return new ApiError(
    parsed.success && parsed.data.message
      ? parsed.data.message
      : 'Unable to complete the request. Please try again.',
    error.response?.status,
    parsed.success ? parsed.data.errors : undefined,
    retryAfterMs,
  )
}
