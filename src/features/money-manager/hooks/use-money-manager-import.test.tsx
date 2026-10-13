import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
    createAccount,
    fetchAccounts,
    fetchAccountTypes,
} from '@/features/accounts/api/account-api'
import {
    createCategory,
    fetchCategories,
} from '@/features/categories/api/category-api'
import { createTransactionsBatch } from '@/features/transactions/api/transaction-api'
import { ApiError } from '@/lib/api-error'
import type { MoneyManagerRecord } from '../types/money-manager'
import { useMoneyManagerImport } from './use-money-manager-import'

vi.mock('@/features/accounts/api/account-api', () => ({
    createAccount: vi.fn(),
    fetchAccounts: vi.fn(),
    fetchAccountTypes: vi.fn(),
}))

vi.mock('@/features/categories/api/category-api', () => ({
    createCategory: vi.fn(),
    fetchCategories: vi.fn(),
}))

vi.mock('@/features/transactions/api/transaction-api', () => ({
    createTransactionsBatch: vi.fn(),
}))

vi.mock('@/features/auth', () => ({
    authSession: { getSnapshot: () => ({ user: { id: 'own-user' } }) },
}))

const accountMappings = { Cash: 'cash-id', Bank: 'bank-id' }
const categoryMappings = { Food: 'food-id' }

function makeCategory(
    id: string,
    type: 'INCOME' | 'EXPENSE',
    userId = 'own-user',
) {
    return {
        id,
        name: 'Food',
        type,
        user_id: userId,
        version: '1',
        created_at: '',
        updated_at: '',
        deleted_at: null,
    }
}

function makeRecord(
    rowIndex: number,
    overrides: Partial<MoneyManagerRecord> = {},
): MoneyManagerRecord {
    return {
        rowIndex,
        dateIso: '2026-10-01T12:00:00.000Z',
        displayDate: '2026-10-01',
        accountName: 'Cash',
        categoryName: 'Food',
        subcategoryName: null,
        note: null,
        description: null,
        amountNumber: 1000,
        amountFormatted: '1000.00',
        type: 'EXPENSE',
        transferToAccountName: null,
        fullDescription: `Row ${rowIndex}`,
        ...overrides,
    }
}

function renderImportHook() {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    })
    function Wrapper({ children }: { children: ReactNode }) {
        return (
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        )
    }
    return renderHook(() => useMoneyManagerImport(), { wrapper: Wrapper })
}

describe('useMoneyManagerImport', () => {
    beforeEach(() => {
        vi.resetAllMocks()
        vi.mocked(fetchAccounts).mockResolvedValue([])
        vi.mocked(fetchAccountTypes).mockResolvedValue([])
        vi.mocked(fetchCategories).mockResolvedValue([
            makeCategory('food-id', 'EXPENSE'),
        ])
        vi.mocked(createTransactionsBatch).mockImplementation((items) =>
            Promise.resolve({
                count: items.length,
            }),
        )
    })

    it.each([false, true])(
        'keeps same-name income and expense distinct (reversed=%s)',
        async (reversed) => {
            const categories = [
                makeCategory('expense-id', 'EXPENSE'),
                makeCategory('income-id', 'INCOME'),
            ]
            vi.mocked(fetchCategories).mockResolvedValue(
                reversed ? [...categories].reverse() : categories,
            )
            const records = [
                makeRecord(2),
                makeRecord(3, { type: 'INCOME', categoryName: ' food ' }),
            ]
            if (reversed) records.reverse()
            const { result } = renderImportHook()
            await act(async () => {
                await result.current.executeImport({
                    records,
                    accountMappings,
                    categoryMappings: {
                        'EXPENSE:food': 'expense-id',
                        'INCOME:food': 'income-id',
                    },
                })
            })
            const submitted = vi.mocked(createTransactionsBatch).mock.calls[0]?.[0]
            expect(submitted).toHaveLength(records.length)
            records.forEach((record, index) => {
                expect(submitted?.[index]).toMatchObject({
                    type: record.type,
                    category_id: record.type === 'INCOME' ? 'income-id' : 'expense-id',
                })
            })
            expect(fetchCategories).toHaveBeenCalledWith({ account_id: 'cash-id' })
            expect(createCategory).not.toHaveBeenCalled()
        },
    )

    it.each(['Food', 'EXPENSE:food'])(
        'ignores a wrong-type mapping keyed by %s',
        async (key) => {
            vi.mocked(fetchCategories).mockResolvedValue([
                makeCategory('income-id', 'INCOME'),
                makeCategory('expense-id', 'EXPENSE'),
            ])
            const { result } = renderImportHook()
            await act(async () => {
                await result.current.executeImport({
                    records: [makeRecord(2)],
                    accountMappings,
                    categoryMappings: { [key]: 'income-id' },
                })
            })
            expect(createTransactionsBatch).toHaveBeenCalledWith([
                expect.objectContaining({ type: 'EXPENSE', category_id: 'expense-id' }),
            ])
            expect(createCategory).not.toHaveBeenCalled()
        },
    )

    it('uses the target account owner category instead of the importer category', async () => {
        vi.mocked(fetchCategories).mockImplementation((params) =>
            Promise.resolve(
                params?.account_id
                    ? [makeCategory('foreign-food', 'EXPENSE', 'foreign-user')]
                    : [makeCategory('own-food', 'EXPENSE')],
            ),
        )
        const { result } = renderImportHook()
        await act(async () => {
            await result.current.executeImport({
                records: [makeRecord(2)],
                accountMappings,
                categoryMappings: { Food: 'own-food' },
            })
        })
        expect(createTransactionsBatch).toHaveBeenCalledWith([
            expect.objectContaining({ category_id: 'foreign-food' }),
        ])
        expect(createCategory).not.toHaveBeenCalled()
    })

    it.each(['foreign-user', undefined])(
        'does not create a missing category for foreign or unknown owner %s',
        async (ownerId) => {
            vi.mocked(fetchCategories).mockResolvedValue([])
            if (ownerId) {
                vi.mocked(fetchAccounts).mockResolvedValue([
                    {
                        id: 'cash-id',
                        user_id: 'own-user',
                        account_type_id: 'cash-type',
                        parent_account_id: null,
                        icon: null,
                        name: 'Cash',
                        currency: 'IDR',
                        balance: '0',
                        description: null,
                        is_visible: true,
                        is_include_total: true,
                        sequence_order: '1',
                        version: '1',
                        created_at: '',
                        updated_at: '',
                        deleted_at: null,
                    },
                ])
                vi.mocked(fetchAccountTypes).mockResolvedValue([
                    {
                        id: 'cash-type',
                        user_id: ownerId,
                        name: 'Cash',
                        category: 'CASH',
                        version: '1',
                        created_at: '',
                        updated_at: '',
                        deleted_at: null,
                    },
                ])
            }
            const { result } = renderImportHook()
            await act(async () => {
                await expect(
                    result.current.executeImport({
                        records: [makeRecord(2)],
                        accountMappings,
                        categoryMappings,
                    }),
                ).rejects.toThrow('Minta pemilik akun')
            })
            expect(createCategory).not.toHaveBeenCalled()
            expect(createTransactionsBatch).not.toHaveBeenCalled()
        },
    )

    it('creates both missing name/type pairs for a verified own account only once', async () => {
        vi.mocked(fetchAccounts).mockResolvedValue([
            {
                id: 'cash-id',
                user_id: 'own-user',
                account_type_id: 'cash-type',
                parent_account_id: null,
                icon: null,
                name: 'Cash',
                currency: 'IDR',
                balance: '0',
                description: null,
                is_visible: true,
                is_include_total: true,
                sequence_order: '1',
                version: '1',
                created_at: '',
                updated_at: '',
                deleted_at: null,
            },
        ])
        vi.mocked(fetchAccountTypes).mockResolvedValue([
            {
                id: 'cash-type',
                user_id: 'own-user',
                name: 'Cash',
                category: 'CASH',
                version: '1',
                created_at: '',
                updated_at: '',
                deleted_at: null,
            },
        ])
        vi.mocked(fetchCategories).mockResolvedValue([])
        vi.mocked(createCategory).mockImplementation((input) =>
            Promise.resolve(makeCategory(`${input.type}-id`, input.type)),
        )
        const records = [
            makeRecord(2, { type: 'INCOME' }),
            makeRecord(3),
            makeRecord(4, { type: 'INCOME' }),
        ]
        const { result } = renderImportHook()
        await act(async () => {
            const outcome = await result.current.executeImport({
                records,
                accountMappings,
                categoryMappings,
            })
            expect(outcome.categoriesCreated).toBe(2)
        })
        expect(vi.mocked(createCategory).mock.calls).toEqual([
            [{ name: 'Food', type: 'INCOME' }],
            [{ name: 'Food', type: 'EXPENSE' }],
        ])
        const submitted = vi.mocked(createTransactionsBatch).mock.calls[0]?.[0]
        expect(submitted).toHaveLength(records.length)
        records.forEach((record, index) => {
            expect(submitted?.[index]).toMatchObject({
                type: record.type,
                category_id: `${record.type}-id`,
            })
        })
    })

    it('imports 205 rows in sequential batches of 100, 100, and 5', async () => {
        const records = Array.from({ length: 205 }, (_, index) =>
            makeRecord(index + 2),
        )
        let inFlight = 0
        let maximumInFlight = 0
        const events: string[] = []
        vi.mocked(createTransactionsBatch).mockImplementation(async (items) => {
            inFlight++
            maximumInFlight = Math.max(maximumInFlight, inFlight)
            events.push(`start:${items[0]?.description}`)
            await Promise.resolve()
            await Promise.resolve()
            events.push(`end:${items[0]?.description}`)
            inFlight--
            return { count: items.length }
        })
        const { result } = renderImportHook()

        await act(async () => {
            const outcome = await result.current.executeImport({
                records,
                accountMappings,
                categoryMappings,
            })
            expect(outcome).toMatchObject({
                current: 205,
                total: 205,
                percentage: 100,
                successCount: 205,
                errorCount: 0,
                errors: [],
            })
        })

        expect(createTransactionsBatch).toHaveBeenCalledTimes(3)
        expect(
            vi
                .mocked(createTransactionsBatch)
                .mock.calls.map(([items]) => items.length),
        ).toEqual([100, 100, 5])
        expect(maximumInFlight).toBe(1)
        expect(events).toEqual([
            'start:Row 2',
            'end:Row 2',
            'start:Row 102',
            'end:Row 102',
            'start:Row 202',
            'end:Row 202',
        ])
        expect(
            vi
                .mocked(createTransactionsBatch)
                .mock.calls.flatMap(([items]) => items.map((item) => item.description)),
        ).toEqual(records.map((record) => record.fullDescription))
        expect(createAccount).not.toHaveBeenCalled()
        expect(createCategory).not.toHaveBeenCalled()
        expect(result.current.isImporting).toBe(false)
        expect(result.current.progress.successCount).toBe(205)
    })

    it('splits atomic 422 failures and counts only the single invalid row as failed', async () => {
        const records = Array.from({ length: 5 }, (_, index) =>
            makeRecord(index + 2),
        )
        const committed: string[] = []
        vi.mocked(createTransactionsBatch).mockImplementation(async (items) => {
            await Promise.resolve()
            if (items.some((item) => item.description === 'Row 4')) {
                throw new ApiError('Baris tidak valid.', 422)
            }
            committed.push(...items.map((item) => item.description ?? ''))
            return { count: items.length }
        })
        const { result } = renderImportHook()

        await act(async () => {
            const outcome = await result.current.executeImport({
                records,
                accountMappings,
                categoryMappings,
            })
            expect(outcome).toMatchObject({
                current: 5,
                total: 5,
                percentage: 100,
                successCount: 4,
                errorCount: 1,
                currentStatus: 'Selesai dengan kendala.',
                errors: [
                    {
                        index: 4,
                        description: '2026-10-01 - Row 4 (1000.00)',
                        error: 'Baris tidak valid.',
                        retryable: true,
                    },
                ],
            })
        })

        expect(
            vi
                .mocked(createTransactionsBatch)
                .mock.calls.map(([items]) => items.map((item) => item.description)),
        ).toEqual([
            ['Row 2', 'Row 3', 'Row 4', 'Row 5', 'Row 6'],
            ['Row 2', 'Row 3'],
            ['Row 4', 'Row 5', 'Row 6'],
            ['Row 4'],
            ['Row 5', 'Row 6'],
        ])
        expect(committed).toEqual(['Row 2', 'Row 3', 'Row 5', 'Row 6'])
        expect(result.current.progress.errors).toHaveLength(1)
        expect(result.current.progress.errors[0]?.retryable).toBe(true)
        expect(result.current.isImporting).toBe(false)
    })

    it('stops on 500 without retrying, splitting, or submitting remaining batches', async () => {
        const records = Array.from({ length: 205 }, (_, index) =>
            makeRecord(index + 2),
        )
        vi.mocked(createTransactionsBatch)
            .mockResolvedValueOnce({ count: 100 })
            .mockRejectedValueOnce(new ApiError('Server tidak tersedia.', 500))
        const { result } = renderImportHook()

        await act(async () => {
            const outcome = await result.current.executeImport({
                records,
                accountMappings,
                categoryMappings,
            })
            expect(outcome).toMatchObject({
                current: 205,
                total: 205,
                percentage: 100,
                successCount: 100,
                errorCount: 105,
                currentStatus: 'Impor dihentikan.',
            })
            expect(outcome.errors.map((error) => error.index)).toEqual(
                records.slice(100).map((record) => record.rowIndex),
            )
            expect(
                outcome.errors
                    .slice(0, 100)
                    .every(
                        (error) =>
                            error.error === 'Server tidak tersedia.' &&
                            error.retryable === false,
                    ),
            ).toBe(true)
            expect(
                outcome.errors
                    .slice(100)
                    .every(
                        (error) =>
                            error.error.includes('Belum diimpor karena proses dihentikan.') &&
                            error.retryable === true,
                    ),
            ).toBe(true)
        })

        expect(createTransactionsBatch).toHaveBeenCalledTimes(2)
        expect(
            vi
                .mocked(createTransactionsBatch)
                .mock.calls.map(([items]) => items.length),
        ).toEqual([100, 100])
        expect(result.current.progress.errorCount).toBe(105)
        expect(result.current.isImporting).toBe(false)
    })

    it('preserves transfers during validation splits instead of converting them to expenses', async () => {
        const records = [
            makeRecord(2, { type: 'TRANSFER', transferToAccountName: 'Bank' }),
            makeRecord(3, { type: 'TRANSFER', transferToAccountName: null }),
        ]
        vi.mocked(createTransactionsBatch).mockImplementation(async (items) => {
            await Promise.resolve()
            if (
                items.some((item) => item.type === 'TRANSFER' && !item.to_account_id)
            ) {
                throw new ApiError('Akun tujuan wajib diisi.', 422)
            }
            return { count: items.length }
        })
        const { result } = renderImportHook()

        await act(async () => {
            const outcome = await result.current.executeImport({
                records,
                accountMappings,
                categoryMappings,
            })
            expect(outcome).toMatchObject({
                successCount: 1,
                errorCount: 1,
                errors: [
                    {
                        index: 3,
                        description: '2026-10-01 - Row 3 (1000.00)',
                        error: 'Akun tujuan wajib diisi.',
                    },
                ],
            })
        })

        expect(createTransactionsBatch).toHaveBeenCalledTimes(3)
        const submitted = vi
            .mocked(createTransactionsBatch)
            .mock.calls.flatMap(([items]) => items)
        expect(submitted).toHaveLength(4)
        for (const item of submitted) {
            expect(item).toMatchObject({
                type: 'TRANSFER',
                from_account_id: 'cash-id',
                to_account_id: item.description === 'Row 2' ? 'bank-id' : '',
                amount: '1000.00',
                transacted_at: '2026-10-01T12:00:00.000Z',
            })
            expect(item).not.toHaveProperty('account_id')
            expect(item).not.toHaveProperty('category_id')
        }
        expect(result.current.isImporting).toBe(false)
    })
})
