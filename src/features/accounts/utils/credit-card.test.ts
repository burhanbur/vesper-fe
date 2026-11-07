import { describe, expect, it } from 'vitest'
import type { AccountDto } from '../types/account'
import {
    accountCardMetadataSchema,
    accountFormSchema,
    creditLimitSchema,
} from '../schemas/account-schema'
import {
    canRepayCard,
    creditCardSummary,
    formatExactRupiah,
    isActiveLeaf,
    isPositiveMoney,
    moneyDecimal,
    moneyUnits,
} from './credit-card'
import {
    computeAccountsOverview,
    resolveAccountCategory,
} from './account-grouping'

export const cardFixture: AccountDto = {
    id: 'card',
    user_id: 'owner',
    account_type_id: 'cash',
    parent_account_id: null,
    name: 'Personal',
    icon: 'bank',
    currency: 'IDR',
    balance: '-2000000.00',
    is_credit_card: true,
    credit_limit: '1000000.00',
    description: null,
    is_visible: true,
    is_include_total: true,
    sequence_order: '0',
    version: '9007199254740993123',
    created_at: '',
    updated_at: '',
    deleted_at: null,
}

describe('simple credit cards', () => {
    it('defaults omitted metadata without changing opaque versions or decimals', () => {
        const {
            is_credit_card: _flag,
            credit_limit: _limit,
            ...legacy
        } = cardFixture
        expect(_flag).toBe(true)
        expect(_limit).toBe('1000000.00')
        expect(accountCardMetadataSchema.parse(legacy)).toEqual({
            ...legacy,
            is_credit_card: false,
            credit_limit: null,
        })
        expect(accountCardMetadataSchema.parse(cardFixture)).toEqual(cardFixture)
    })

    it.each([null, '0.01', '1000000.00', '999999999999999999.99'])(
        'accepts exact nullable limit %s',
        (limit) => {
            expect(creditLimitSchema.parse(limit)).toBe(limit)
        },
    )

    it.each(['0', '0.00', '-1', '1.001', '1e3', '1000000000000000000.00'])(
        'rejects invalid limit %s',
        (limit) => {
            expect(creditLimitSchema.safeParse(limit).success).toBe(false)
        },
    )

    it('keeps overpayment separate from remaining contractual limit', () => {
        let balance = moneyUnits('-2000000.00') + moneyUnits('2500000.00')
        expect(creditCardSummary(moneyDecimal(balance), '1000000.00')).toEqual({
            debt: '0.00',
            overpayment: '500000.00',
            remaining: '1000000.00',
        })
        balance -= moneyUnits('200000.00')
        expect(moneyDecimal(balance)).toBe('300000.00')
        balance -= moneyUnits('400000.00')
        expect(creditCardSummary(moneyDecimal(balance), '1000000.00')).toEqual({
            debt: '100000.00',
            overpayment: '0.00',
            remaining: '900000.00',
        })
        expect(creditCardSummary('-1200000.00', '1000000.00').remaining).toBe(
            '-200000.00',
        )
        expect(creditCardSummary('-1200000.00').remaining).toBeNull()
    })

    it('preserves fractions beyond Number precision and validates tiny positive amounts', () => {
        expect(moneyDecimal(moneyUnits('999999999999999999.99') - 1n)).toBe(
            '999999999999999999.98',
        )
        expect(formatExactRupiah('999999999999999999.99')).toBe(
            'Rp 999.999.999.999.999.999,99',
        )
        expect(isPositiveMoney('0.01')).toBe(true)
        expect(isPositiveMoney('0.00')).toBe(false)
        expect(isPositiveMoney('1.001')).toBe(false)
    })

    it('classifies flagged cards explicitly and excludes positive credit from liquid cash', () => {
        const bank = {
            ...cardFixture,
            id: 'bank',
            name: 'BCA',
            balance: '9007199254740993.01',
            is_credit_card: false,
            credit_limit: null,
        }
        const credit = { ...cardFixture, balance: '500000.02' }
        expect(resolveAccountCategory(credit)).toBe('liability')
        expect(
            resolveAccountCategory({ ...bank, name: 'Kartu Kredit', icon: 'bank' }),
        ).toBe('bank')
        const overview = computeAccountsOverview(
            [bank, credit],
            new Map(),
            new Map(),
        )
        expect(overview.liquidCash).toBe(moneyUnits(bank.balance))
        expect(overview.netWorth).toBe(
            moneyUnits(bank.balance) + moneyUnits(credit.balance),
        )
        expect(overview.liabilities).toBe(0n)
        expect(
            computeAccountsOverview([cardFixture], new Map(), new Map()).netWorth,
        ).toBe(-200000000n)
    })

    it('restricts repayments to same-owner IDR and leaf accounts', () => {
        const bank = { ...cardFixture, id: 'bank', is_credit_card: false }
        expect(canRepayCard(bank, cardFixture)).toBe(true)
        expect(canRepayCard({ ...bank, user_id: 'other' }, cardFixture)).toBe(false)
        expect(canRepayCard({ ...bank, currency: 'USD' }, cardFixture)).toBe(false)
        expect(canRepayCard(cardFixture, bank)).toBe(false)
        expect(
            isActiveLeaf(bank, [
                bank,
                { ...cardFixture, parent_account_id: bank.id },
            ]),
        ).toBe(false)
    })

    it('allows zero-balance setup and lower limits without opening-debt fields', () => {
        const parsed = accountFormSchema.parse({
            name: 'Card',
            account_type_id: 'cash',
            parent_account_id: '',
            icon: 'bank',
            description: '',
            is_include_total: true,
            is_credit_card: true,
            credit_limit: '0.01',
            balance: '-100',
        })
        expect(parsed).not.toHaveProperty('balance')
    })
})
