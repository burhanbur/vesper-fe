import type { AccountDto } from '../types/account'

/** Decimal(20,2) arithmetic; never convert monetary values to Number. */
export function moneyUnits(value: string): bigint {
    if (!/^-?\d+(\.\d{1,2})?$/.test(value))
        throw new Error('Nominal tidak valid.')
    const negative = value.startsWith('-')
    const [whole = '0', fraction = ''] = value.replace(/^-/, '').split('.')
    const units = BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0'))
    return negative ? -units : units
}

export function moneyDecimal(units: bigint): string {
    const absolute = units < 0n ? -units : units
    return `${units < 0n ? '-' : ''}${absolute / 100n}.${String(absolute % 100n).padStart(2, '0')}`
}

export function formatExactRupiah(value: string): string {
    const units = moneyUnits(value)
    const absolute = units < 0n ? -units : units
    const whole = new Intl.NumberFormat('id-ID').format(absolute / 100n)
    return `${units < 0n ? '-' : ''}Rp ${whole},${String(absolute % 100n).padStart(2, '0')}`
}

export function creditCardSummary(
    balance: string,
    limit: string | null = null,
) {
    const signed = moneyUnits(balance)
    const debt = signed < 0n ? -signed : 0n
    return {
        debt: moneyDecimal(debt),
        overpayment: moneyDecimal(signed > 0n ? signed : 0n),
        remaining: limit === null ? null : moneyDecimal(moneyUnits(limit) - debt),
    }
}

export function isActiveLeaf(account: AccountDto, accounts: AccountDto[]) {
    return (
        !account.deleted_at &&
        !accounts.some(
            (child) => !child.deleted_at && child.parent_account_id === account.id,
        )
    )
}

export function isPositiveMoney(value: string): boolean {
    return /^\d{1,18}(\.\d{1,2})?$/.test(value) && moneyUnits(value) > 0n
}

export function canRepayCard(source: AccountDto, card: AccountDto) {
    return (
        Boolean(card.is_credit_card) &&
        !card.deleted_at &&
        !card.parent_account_id &&
        !source.is_credit_card &&
        !source.deleted_at &&
        source.user_id === card.user_id &&
        source.currency === 'IDR' &&
        card.currency === 'IDR' &&
        source.id !== card.id
    )
}
