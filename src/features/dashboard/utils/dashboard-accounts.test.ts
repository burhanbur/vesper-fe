import { describe, expect, it } from 'vitest'
import type { AccountDto } from '@/features/accounts/types/account'
import {
    includedDashboardAccounts,
    visibleDashboardAccounts,
} from './dashboard-accounts'

function account(id: string, overrides: Partial<AccountDto> = {}): AccountDto {
    return {
        id,
        user_id: 'user',
        account_type_id: 'type',
        parent_account_id: null,
        icon: null,
        name: id,
        currency: 'IDR',
        balance: '1000000.00',
        description: null,
        is_visible: true,
        is_include_total: true,
        sequence_order: '0',
        version: '1',
        created_at: '',
        updated_at: '',
        deleted_at: null,
        ...overrides,
    }
}

describe('includedDashboardAccounts', () => {
    it('counts hidden included accounts but not visible excluded or deleted accounts', () => {
        const included = includedDashboardAccounts([
            account('hidden', { is_visible: false }),
            account('excluded', { is_include_total: false }),
            account('deleted', { deleted_at: '2026-10-15' }),
        ])
        expect(included.map((item) => item.id)).toEqual(['hidden'])
        expect(included.reduce((sum, item) => sum + Number(item.balance), 0)).toBe(
            1000000,
        )
    })

    it('uses each pocket inclusion flag independently of its parent', () => {
        expect(
            includedDashboardAccounts([
                account('parent', { is_include_total: false, is_visible: false }),
                account('child', { parent_account_id: 'parent' }),
            ]).map((item) => item.id),
        ).toEqual(['child'])
    })
})

describe('visibleDashboardAccounts', () => {
    it('hides account cards independently of inclusion in totals', () => {
        const accounts = [account('cash'), account('debt', { is_visible: false })]
        const visible = visibleDashboardAccounts(accounts)
        expect(visible.map((item) => item.id)).toEqual(['cash'])
        expect(
            visible
                .filter((item) => item.is_include_total)
                .reduce((sum, item) => sum + Number(item.balance), 0),
        ).toBe(1000000)
        expect(accounts).toHaveLength(2)
    })
    it('excludes descendants of hidden parents regardless of input ordering', () => {
        expect(
            visibleDashboardAccounts([
                account('grandchild', { parent_account_id: 'child' }),
                account('child', { parent_account_id: 'parent' }),
                account('parent', { is_visible: false }),
                account('visible'),
            ]).map((item) => item.id),
        ).toEqual(['visible'])
    })
    it('excludes deleted accounts and restores accounts when shown', () => {
        expect(
            visibleDashboardAccounts([
                account('deleted', { deleted_at: '2026-10-15' }),
                account('shown'),
            ]).map((item) => item.id),
        ).toEqual(['shown'])
    })
})
