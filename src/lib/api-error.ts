import axios from 'axios'
import { z } from 'zod'

const apiErrorSchema = z.object({
  message: z.string().optional(),
  errors: z.record(z.string(), z.unknown()).optional(),
})

export class ApiError extends Error {
  readonly status: number | undefined
  readonly details: Readonly<Record<string, unknown>> | undefined

  constructor(
    message: string,
    status: number | undefined,
    details?: Readonly<Record<string, unknown>>,
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

export function normalizeApiError(error: unknown): ApiError {
  if (!axios.isAxiosError(error)) {
    return new ApiError('An unexpected error occurred.', undefined)
  }

  const parsed = apiErrorSchema.safeParse(error.response?.data)
  return new ApiError(
    parsed.success && parsed.data.message
      ? parsed.data.message
      : 'Unable to complete the request. Please try again.',
    error.response?.status,
    parsed.success ? parsed.data.errors : undefined,
  )
}
