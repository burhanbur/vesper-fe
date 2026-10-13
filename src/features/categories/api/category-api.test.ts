import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { apiClient } from '@/lib/api-client'
import { fetchCategories } from './category-api'

const { getMock } = vi.hoisted(() => ({
    getMock: vi.fn<typeof apiClient.get>(),
}))
vi.mock('@/lib/api-client', () => ({ apiClient: { get: getMock } }))

describe('fetchCategories', () => {
    beforeEach(() => vi.resetAllMocks())

    it('fetches every page while preserving the target account owner scope and type', async () => {
        getMock
            .mockResolvedValueOnce({
                data: { data: [{ id: 'first' }], pagination: { last_page: 2 } },
            })
            .mockResolvedValueOnce({
                data: { data: [{ id: 'second' }], pagination: { last_page: 2 } },
            })
        expect(
            await fetchCategories({ account_id: 'shared-account', type: 'INCOME' }),
        ).toEqual([{ id: 'first' }, { id: 'second' }])
        expect(getMock.mock.calls).toEqual([
            [
                '/categories',
                {
                    params: {
                        limit: 100,
                        account_id: 'shared-account',
                        type: 'INCOME',
                        page: 1,
                    },
                },
            ],
            [
                '/categories',
                {
                    params: {
                        limit: 100,
                        account_id: 'shared-account',
                        type: 'INCOME',
                        page: 2,
                    },
                },
            ],
        ])
    })

    it('supports responses without pagination metadata', async () => {
        getMock.mockResolvedValue({ data: { data: [] } })
        expect(await fetchCategories()).toEqual([])
        expect(getMock).toHaveBeenCalledTimes(1)
    })
})
