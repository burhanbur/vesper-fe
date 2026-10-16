import { describe, expect, it } from 'vitest'
import type { AccountDto, AccountTypeDto } from '../types/account'
import {
    computeAccountsOverview,
    getEffectiveBalance,
    groupAccountsByCategory,
    resolveAccountCategory,
    sortAccountList,
} from './account-grouping'

const mockTypeBank: AccountTypeDto = {
    id: 'type-bank',
    user_id: 'u1',
    name: 'Rekening Bank',
    category: 'CASH',
    version: '1',
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
    deleted_at: null,
}

const mockTypeEwallet: AccountTypeDto = {
    id: 'type-ewallet',
    user_id: 'u1',
    name: 'E-wallet',
    category: 'CASH',
    version: '1',
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
    deleted_at: null,
}

const mockTypeCash: AccountTypeDto = {
    id: 'type-cash',
    user_id: 'u1',
    name: 'Cash',
    category: 'CASH',
    version: '1',
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
    deleted_at: null,
}

const mockTypeReksadana: AccountTypeDto = {
    id: 'type-reksadana',
    user_id: 'u1',
    name: 'Reksadana',
    category: 'INVESTMENT',
    version: '1',
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
    deleted_at: null,
}

const mockTypeHutang: AccountTypeDto = {
    id: 'type-hutang',
    user_id: 'u1',
    name: 'Hutang & Piutang',
    category: 'CASH',
    version: '1',
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
    deleted_at: null,
}

function makeAccount(overrides: Partial<AccountDto>): AccountDto {
    return {
        id: 'acc-' + Math.random().toString(36).substring(7),
        user_id: 'u1',
        account_type_id: 'type-bank',
        parent_account_id: null,
        icon: 'bank',
        name: 'Akun Tes',
        currency: 'IDR',
        balance: '100000',
        description: null,
        is_visible: true,
        is_include_total: true,
        sequence_order: '0',
        version: '1',
        created_at: '2026-01-01',
        updated_at: '2026-01-01',
        deleted_at: null,
        ...overrides,
    }
}

describe('account-grouping utils', () => {
    it('correctly resolves account categories based on type and name', () => {
        expect(
            resolveAccountCategory(makeAccount({ name: 'BCA' }), mockTypeBank),
        ).toBe('bank')

        expect(
            resolveAccountCategory(makeAccount({ name: 'GoPay' }), mockTypeEwallet),
        ).toBe('ewallet')

        expect(
            resolveAccountCategory(
                makeAccount({ name: 'Dompet Utama' }),
                mockTypeCash,
            ),
        ).toBe('cash')

        expect(
            resolveAccountCategory(
                makeAccount({ name: 'Bareksa' }),
                mockTypeReksadana,
            ),
        ).toBe('investment')

        expect(
            resolveAccountCategory(
                makeAccount({ name: 'Hutang Kartu' }),
                mockTypeHutang,
            ),
        ).toBe('liability')
    })

    it('calculates effective balance with nested pockets', () => {
        const parent = makeAccount({ id: 'parent-1', balance: '0' })
        const child1 = makeAccount({
            id: 'child-1',
            parent_account_id: 'parent-1',
            balance: '50000',
        })
        const child2 = makeAccount({
            id: 'child-2',
            parent_account_id: 'parent-1',
            balance: '25000',
        })

        expect(getEffectiveBalance(parent, [child1, child2])).toBe(75000)
        expect(getEffectiveBalance(child1, [])).toBe(50000)
    })

    it('sorts accounts by balance descending and ascending', () => {
        const a1 = makeAccount({ id: '1', name: 'Kecil', balance: '10000' })
        const a2 = makeAccount({ id: '2', name: 'Besar', balance: '500000' })
        const a3 = makeAccount({ id: '3', name: 'Nol', balance: '0' })

        const childrenMap = new Map<string, AccountDto[]>()

        const sortedDesc = sortAccountList(
            [a1, a2, a3],
            'balance-desc',
            childrenMap,
        )
        expect(sortedDesc.map((a) => a.id)).toEqual(['2', '1', '3'])

        const sortedAsc = sortAccountList([a1, a2, a3], 'balance-asc', childrenMap)
        expect(sortedAsc.map((a) => a.id)).toEqual(['3', '1', '2'])
    })

    it('groups accounts into structured categories with subtotals', () => {
        const bankAcc = makeAccount({
            id: 'b1',
            name: 'BCA',
            account_type_id: 'type-bank',
            balance: '2000000',
        })
        const walletAcc = makeAccount({
            id: 'w1',
            name: 'GoPay',
            account_type_id: 'type-ewallet',
            balance: '50000',
        })
        const investAcc = makeAccount({
            id: 'i1',
            name: 'Bibit',
            account_type_id: 'type-reksadana',
            balance: '10000000',
        })

        const typeMap = new Map<string, AccountTypeDto>([
            ['type-bank', mockTypeBank],
            ['type-ewallet', mockTypeEwallet],
            ['type-reksadana', mockTypeReksadana],
        ])
        const childrenMap = new Map<string, AccountDto[]>()

        const groups = groupAccountsByCategory(
            [bankAcc, walletAcc, investAcc],
            typeMap,
            childrenMap,
        )

        expect(groups.length).toBe(3)
        expect(groups[0]?.key).toBe('bank')
        expect(groups[0]?.totalBalance).toBe(2000000)
        expect(groups[1]?.key).toBe('ewallet')
        expect(groups[1]?.totalBalance).toBe(50000)
        expect(groups[2]?.key).toBe('investment')
        expect(groups[2]?.totalBalance).toBe(10000000)
    })

    it('computes overall accounts overview metrics accurately', () => {
        const bank = makeAccount({
            id: 'b1',
            name: 'Mandiri',
            account_type_id: 'type-bank',
            balance: '1000000',
        })
        const debt = makeAccount({
            id: 'd1',
            name: 'Hutang Teman',
            account_type_id: 'type-hutang',
            balance: '200000',
        })
        const zeroAcc = makeAccount({
            id: 'z1',
            name: 'Akun Kosong',
            account_type_id: 'type-bank',
            balance: '0',
        })

        const typeMap = new Map<string, AccountTypeDto>([
            ['type-bank', mockTypeBank],
            ['type-hutang', mockTypeHutang],
        ])
        const childrenMap = new Map<string, AccountDto[]>()

        const overview = computeAccountsOverview(
            [bank, debt, zeroAcc],
            childrenMap,
            typeMap,
        )

        expect(overview.totalParentAccounts).toBe(3)
        expect(overview.zeroBalanceCount).toBe(1)
        expect(overview.liquidCash).toBe(1000000)
        expect(overview.liabilities).toBe(200000)
        expect(overview.netWorth).toBe(1200000) // both have is_include_total: true
    })
})
