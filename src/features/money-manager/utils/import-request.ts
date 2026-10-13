import { ApiError } from '@/lib/api-error'

// Retry only explicit rate rejections: timeouts may have already committed a write.
export async function runImportRequest<T>(
    operation: () => Promise<T>,
    onWaiting: () => void,
): Promise<T> {
    for (let attempt = 0; ; attempt++) {
        try {
            return await operation()
        } catch (error) {
            if (
                !(error instanceof ApiError) ||
                error.status !== 429 ||
                attempt >= 3
            ) {
                throw error
            }
            onWaiting()
            await new Promise<void>((resolve) => {
                setTimeout(resolve, error.retryAfterMs ?? 60_000)
            })
        }
    }
}
