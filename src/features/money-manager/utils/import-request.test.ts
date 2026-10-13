import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError, normalizeApiError } from '@/lib/api-error'
import { runImportRequest } from './import-request'

afterEach(() => vi.useRealTimers())

describe('import rate-limit recovery', () => {
    it('waits for Retry-After and retries only the rejected operation', async () => {
        vi.useFakeTimers()
        const operation = vi
            .fn()
            .mockRejectedValueOnce(new ApiError('Limit', 429, undefined, 2_000))
            .mockResolvedValue('saved')
        const waiting = vi.fn()
        const result = runImportRequest(operation, waiting)
        await vi.advanceTimersByTimeAsync(1_999)
        expect(operation).toHaveBeenCalledTimes(1)
        await vi.advanceTimersByTimeAsync(1)
        await expect(result).resolves.toBe('saved')
        expect(waiting).toHaveBeenCalledTimes(1)
    })

    it('bounds retries when the limit persists', async () => {
        vi.useFakeTimers()
        const error = new ApiError('Limit', 429, undefined, 1_000)
        const operation = vi.fn().mockRejectedValue(error)
        const result = runImportRequest(operation, vi.fn())
        const assertion = expect(result).rejects.toBe(error)
        await vi.runAllTimersAsync()
        await assertion
        expect(operation).toHaveBeenCalledTimes(4)
    })

    it.each([undefined, 401, 403, 422, 500])(
        'does not retry ambiguous or non-rate errors (%s)',
        async (status) => {
            const error = new ApiError('Failed', status)
            const operation = vi.fn().mockRejectedValue(error)
            await expect(runImportRequest(operation, vi.fn())).rejects.toBe(error)
            expect(operation).toHaveBeenCalledTimes(1)
        },
    )

    it('preserves normalized errors during auth request retries', () => {
        const error = new ApiError('Limit', 429, undefined, 3_000)
        expect(normalizeApiError(error)).toBe(error)
    })

    it('reads server Retry-After seconds', () => {
        const error = normalizeApiError({
            isAxiosError: true,
            response: {
                status: 429,
                headers: { 'retry-after': '12' },
                data: { message: 'Limit' },
            },
        })
        expect(error.retryAfterMs).toBe(12_000)
    })
})
