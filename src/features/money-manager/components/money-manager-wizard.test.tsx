import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useMoneyManagerImport } from '../hooks/use-money-manager-import'
import type { ImportProgress, MoneyManagerRecord } from '../types/money-manager'
import {
    generateSampleMoneyManagerFile,
    parseMoneyManagerFile,
} from '../utils/money-manager-parser'
import { MoneyManagerWizard } from './money-manager-wizard'

vi.mock('@tanstack/react-router', () => ({ useNavigate: () => vi.fn() }))
vi.mock('sonner', () => ({
    toast: { success: vi.fn(), warning: vi.fn(), error: vi.fn() },
}))
vi.mock('@/features/accounts', () => ({
    useAccounts: () => ({ data: [] }),
    useAccountTypes: () => ({ data: [] }),
}))
vi.mock('@/features/categories', () => ({
    useCategories: () => ({ data: [] }),
}))
vi.mock('../hooks/use-money-manager-import', () => ({
    useMoneyManagerImport: vi.fn(),
}))
vi.mock('../utils/money-manager-parser', () => ({
    generateSampleMoneyManagerFile: vi.fn(),
    parseMoneyManagerFile: vi.fn(),
}))

const records: MoneyManagerRecord[] = Array.from({ length: 5 }, (_, index) => ({
    rowIndex: index + 2,
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
    fullDescription: `Row ${index + 2}`,
}))

function makeProgress(errors: ImportProgress['errors']): ImportProgress {
    return {
        current: records.length,
        total: records.length,
        percentage: 100,
        currentStatus: 'Impor dihentikan.',
        successCount: records.length - errors.length,
        errorCount: errors.length,
        accountsCreated: 0,
        categoriesCreated: 0,
        errors,
    }
}

function mockImport(progress: ImportProgress) {
    const executeImport =
        vi.fn<ReturnType<typeof useMoneyManagerImport>['executeImport']>()
    executeImport.mockResolvedValue(progress)
    vi.mocked(useMoneyManagerImport).mockReturnValue({
        progress,
        executeImport,
        resetProgress: vi.fn(),
        isImporting: false,
    })
    return executeImport
}

async function completeInitialImport() {
    const user = userEvent.setup()
    render(<MoneyManagerWizard />)
    await user.click(
        screen.getByRole('button', { name: 'Uji Coba dengan Data Sampel' }),
    )
    await user.click(
        await screen.findByRole('button', { name: /Mulai Migrasi ke Vesper/ }),
    )
    await screen.findByRole('heading', {
        name: 'Migrasi Belum Berhasil Sepenuhnya',
    })
    return user
}

describe('MoneyManagerWizard retry UI', () => {
    beforeEach(() => {
        vi.resetAllMocks()
        vi.mocked(generateSampleMoneyManagerFile).mockReturnValue(
            new Blob(['sample']),
        )
        vi.mocked(parseMoneyManagerFile).mockResolvedValue({
            records,
            summary: {
                fileName: 'sample.xlsx',
                fileSize: 6,
                totalRowsParsed: records.length,
                validRecordsCount: records.length,
                incomeCount: 0,
                expenseCount: records.length,
                transferCount: 0,
                totalIncomeAmount: 0,
                totalExpenseAmount: 5000,
                earliestDate: '2026-10-01',
                latestDate: '2026-10-01',
                uniqueAccounts: ['Cash'],
                uniqueCategories: [{ name: 'Food', type: 'EXPENSE' }],
            },
        })
    })

    it('retries only explicitly retryable rows, excluding successful and ambiguous rows', async () => {
        const executeImport = mockImport(
            makeProgress([
                {
                    index: 3,
                    description: 'Row 3',
                    error: 'Invalid row',
                    retryable: true,
                },
                {
                    index: 4,
                    description: 'Row 4',
                    error: 'Ambiguous server failure',
                    retryable: false,
                },
                { index: 5, description: 'Row 5', error: 'Not sent', retryable: true },
                { index: 6, description: 'Row 6', error: 'Unknown outcome' },
            ]),
        )
        const user = await completeInitialImport()

        expect(parseMoneyManagerFile).toHaveBeenCalledWith(expect.any(File))
        expect(executeImport).toHaveBeenCalledTimes(1)
        expect(executeImport).toHaveBeenNthCalledWith(1, {
            records,
            accountMappings: { Cash: 'NEW' },
            categoryMappings: { 'EXPENSE:food': 'NEW' },
        })

        await user.click(
            screen.getByRole('button', { name: 'Coba ulang hanya transaksi gagal' }),
        )

        expect(executeImport).toHaveBeenCalledTimes(2)
        expect(executeImport).toHaveBeenNthCalledWith(2, {
            records: records.filter((record) => [3, 5].includes(record.rowIndex)),
            accountMappings: { Cash: 'NEW' },
            categoryMappings: { 'EXPENSE:food': 'NEW' },
        })
        expect(
            executeImport.mock.calls[1]?.[0].records.map((record) => record.rowIndex),
        ).toEqual([3, 5])
    })

    it('does not offer retry when all errors have ambiguous outcomes', async () => {
        const executeImport = mockImport(
            makeProgress([
                {
                    index: 3,
                    description: 'Row 3',
                    error: 'Server failure',
                    retryable: false,
                },
                { index: 4, description: 'Row 4', error: 'Unknown outcome' },
            ]),
        )
        await completeInitialImport()

        expect(
            screen.queryByRole('button', {
                name: 'Coba ulang hanya transaksi gagal',
            }),
        ).not.toBeInTheDocument()
        expect(executeImport).toHaveBeenCalledTimes(1)
    })
})
