import type { AccountDto, AccountTypeDto } from '../types/account'

export type AccountGroupKey =
    'bank' | 'ewallet' | 'cash' | 'investment' | 'liability' | 'other'

export type AccountSortOption =
    'balance-desc' | 'balance-asc' | 'name-asc' | 'name-desc' | 'default'

export interface AccountCategoryMeta {
    key: AccountGroupKey
    name: string
    shortName: string
    description: string
    icon: 'bank' | 'wallet' | 'cash' | 'chart' | 'scale' | 'layers'
    color: string
    bgLight: string
    badgeVariant:
    | 'default'
    | 'secondary'
    | 'outline'
    | 'success'
    | 'warning'
    | 'info'
    | 'destructive'
    order: number
}

export const ACCOUNT_CATEGORIES: Record<AccountGroupKey, AccountCategoryMeta> =
{
    bank: {
        key: 'bank',
        name: 'Rekening Bank',
        shortName: 'Bank',
        description: 'Tabungan perbankan, giro, dan rekening digital',
        icon: 'bank',
        color: 'text-blue-400',
        bgLight: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
        badgeVariant: 'info',
        order: 1,
    },
    ewallet: {
        key: 'ewallet',
        name: 'Dompet Digital (E-Wallet)',
        shortName: 'E-Wallet',
        description: 'GoPay, OVO, DANA, ShopeePay, LinkAja, dll.',
        icon: 'wallet',
        color: 'text-cyan-400',
        bgLight: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
        badgeVariant: 'default',
        order: 2,
    },
    cash: {
        key: 'cash',
        name: 'Kas & Uang Tunai',
        shortName: 'Kas & Tunai',
        description: 'Uang fisik di dompet, brankas, atau kas kecil',
        icon: 'cash',
        color: 'text-emerald-400',
        bgLight: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
        badgeVariant: 'success',
        order: 3,
    },
    investment: {
        key: 'investment',
        name: 'Investasi & Portofolio',
        shortName: 'Investasi',
        description: 'Reksadana, saham, crypto, obligasi, dan RDN',
        icon: 'chart',
        color: 'text-amber-400',
        bgLight: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
        badgeVariant: 'warning',
        order: 4,
    },
    liability: {
        key: 'liability',
        name: 'Hutang & Kewajiban',
        shortName: 'Hutang',
        description: 'Pinjaman, paylater, kartu kredit, dan hutang piutang',
        icon: 'scale',
        color: 'text-rose-400',
        bgLight: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
        badgeVariant: 'destructive',
        order: 5,
    },
    other: {
        key: 'other',
        name: 'Akun Lainnya',
        shortName: 'Lainnya',
        description: 'Kategori rekening lainnya',
        icon: 'layers',
        color: 'text-slate-400',
        bgLight: 'bg-slate-500/10 border-slate-500/30 text-slate-400',
        badgeVariant: 'outline',
        order: 6,
    },
}

/**
 * Resolves an account into a standard financial group based on its account type and metadata.
 */
export function resolveAccountCategory(
    account: AccountDto,
    type?: AccountTypeDto,
): AccountGroupKey {
    const typeName = (type?.name || '').toLowerCase()
    const accName = account.name.toLowerCase()

    // 1. Check Liability keywords first to catch debt accounts
    if (
        typeName.includes('hutang') ||
        typeName.includes('utang') ||
        typeName.includes('piutang') ||
        typeName.includes('kredit') ||
        typeName.includes('pinjaman') ||
        typeName.includes('paylater') ||
        typeName.includes('liability') ||
        accName.includes('hutang') ||
        accName.includes('utang') ||
        accName.includes('paylater')
    ) {
        return 'liability'
    }

    // 2. Check Investment keywords or INVESTMENT category
    if (
        type?.category === 'INVESTMENT' ||
        typeName.includes('reksadana') ||
        typeName.includes('saham') ||
        typeName.includes('crypto') ||
        typeName.includes('kripto') ||
        typeName.includes('investasi') ||
        typeName.includes('obligasi') ||
        typeName.includes('sbn') ||
        typeName.includes('emas') ||
        accName.includes('reksadana') ||
        accName.includes('saham') ||
        accName.includes('bibit') ||
        accName.includes('bareksa') ||
        accName.includes('stockbit') ||
        accName.includes('ajaib')
    ) {
        return 'investment'
    }

    // 3. Check E-Wallet keywords
    if (
        typeName.includes('wallet') ||
        typeName.includes('dompet digital') ||
        typeName.includes('e-wallet') ||
        typeName.includes('ewallet') ||
        ['gopay', 'ovo', 'dana', 'shopeepay', 'linkaja', 'astrapay'].some(
            (w) => typeName.includes(w) || accName.includes(w),
        )
    ) {
        return 'ewallet'
    }

    // 4. Check Cash keywords
    if (
        typeName.includes('cash') ||
        typeName.includes('tunai') ||
        typeName.includes('uang tunai') ||
        accName === 'dompet' ||
        accName === 'pocket' ||
        accName.includes('uang tunai')
    ) {
        return 'cash'
    }

    // 5. Check Bank keywords
    if (
        typeName.includes('bank') ||
        typeName.includes('rekening') ||
        typeName.includes('giro') ||
        typeName.includes('tabungan') ||
        [
            'bca',
            'mandiri',
            'bri',
            'bsi',
            'bni',
            'cimb',
            'jago',
            'permata',
            'jenius',
        ].some((b) => accName.includes(b))
    ) {
        return 'bank'
    }

    // 6. Icon fallback
    if (account.icon === 'bank') return 'bank'
    if (account.icon === 'wallet') return 'ewallet'
    if (account.icon === 'cash') return 'cash'
    if (account.icon === 'chart') return 'investment'
    if (account.icon === 'handshake') return 'liability'

    return 'other'
}

/**
 * Calculates effective balance for an account:
 * If it has sub-accounts (children), it aggregates their balances.
 * Otherwise it uses the account's own balance.
 */
export function getEffectiveBalance(
    account: AccountDto,
    children: AccountDto[] = [],
): number {
    if (children.length > 0) {
        return children.reduce(
            (sum, c) => sum + Number.parseFloat(c.balance || '0'),
            0,
        )
    }
    return Number.parseFloat(account.balance || '0')
}

/**
 * Sorts accounts according to the chosen sort option.
 */
export function sortAccountList(
    accounts: AccountDto[],
    sortOption: AccountSortOption,
    childrenMap: Map<string, AccountDto[]>,
): AccountDto[] {
    const result = [...accounts]

    switch (sortOption) {
        case 'balance-desc':
            return result.sort((a, b) => {
                const balA = getEffectiveBalance(a, childrenMap.get(a.id))
                const balB = getEffectiveBalance(b, childrenMap.get(b.id))
                if (balB !== balA) return balB - balA
                return a.name.localeCompare(b.name, 'id', { sensitivity: 'base' })
            })

        case 'balance-asc':
            return result.sort((a, b) => {
                const balA = getEffectiveBalance(a, childrenMap.get(a.id))
                const balB = getEffectiveBalance(b, childrenMap.get(b.id))
                if (balA !== balB) return balA - balB
                return a.name.localeCompare(b.name, 'id', { sensitivity: 'base' })
            })

        case 'name-asc':
            return result.sort((a, b) =>
                a.name.localeCompare(b.name, 'id', { sensitivity: 'base' }),
            )

        case 'name-desc':
            return result.sort((a, b) =>
                b.name.localeCompare(a.name, 'id', { sensitivity: 'base' }),
            )

        case 'default':
        default:
            // Return in sequence order or original order
            return result.sort((a, b) => {
                const orderA = Number.parseInt(a.sequence_order || '0', 10)
                const orderB = Number.parseInt(b.sequence_order || '0', 10)
                if (orderA !== orderB) return orderA - orderB
                return a.name.localeCompare(b.name, 'id', { sensitivity: 'base' })
            })
    }
}

export interface GroupedAccountsData {
    key: AccountGroupKey
    meta: AccountCategoryMeta
    accounts: AccountDto[]
    totalBalance: number
    includedBalance: number
    totalPockets: number
}

/**
 * Groups parent accounts by their resolved financial category.
 */
export function groupAccountsByCategory(
    parents: AccountDto[],
    typeMap: Map<string, AccountTypeDto>,
    childrenMap: Map<string, AccountDto[]>,
    sortOption: AccountSortOption = 'balance-desc',
): GroupedAccountsData[] {
    const groups: Record<AccountGroupKey, AccountDto[]> = {
        bank: [],
        ewallet: [],
        cash: [],
        investment: [],
        liability: [],
        other: [],
    }

    for (const parent of parents) {
        const parentType = typeMap.get(parent.account_type_id)
        const categoryKey = resolveAccountCategory(parent, parentType)
        groups[categoryKey].push(parent)
    }

    const categoryKeys = Object.keys(ACCOUNT_CATEGORIES) as AccountGroupKey[]
    const sortedCategories = categoryKeys.sort(
        (a, b) => ACCOUNT_CATEGORIES[a].order - ACCOUNT_CATEGORIES[b].order,
    )

    return sortedCategories
        .map((key) => {
            const meta = ACCOUNT_CATEGORIES[key]
            const accountsInGroup = sortAccountList(
                groups[key],
                sortOption,
                childrenMap,
            )

            let totalBalance = 0
            let includedBalance = 0
            let totalPockets = 0

            for (const acc of accountsInGroup) {
                const children = childrenMap.get(acc.id) || []
                totalPockets += children.length

                const effBal = getEffectiveBalance(acc, children)
                totalBalance += effBal

                if (children.length > 0) {
                    for (const child of children) {
                        if (child.is_include_total) {
                            includedBalance += Number.parseFloat(child.balance || '0')
                        }
                    }
                } else if (acc.is_include_total) {
                    includedBalance += effBal
                }
            }

            return {
                key,
                meta,
                accounts: accountsInGroup,
                totalBalance,
                includedBalance,
                totalPockets,
            }
        })
        .filter((g) => g.accounts.length > 0)
}

export interface AccountsOverviewStats {
    netWorth: number
    liquidCash: number
    investments: number
    liabilities: number
    totalParentAccounts: number
    totalPockets: number
    zeroBalanceCount: number
}

/**
 * Computes high-level overview metrics across all accounts.
 */
export function computeAccountsOverview(
    parents: AccountDto[],
    childrenMap: Map<string, AccountDto[]>,
    typeMap: Map<string, AccountTypeDto>,
): AccountsOverviewStats {
    let netWorth = 0
    let liquidCash = 0
    let investments = 0
    let liabilities = 0
    let totalPockets = 0
    let zeroBalanceCount = 0

    for (const parent of parents) {
        const children = childrenMap.get(parent.id) || []
        totalPockets += children.length
        const effBal = getEffectiveBalance(parent, children)

        if (effBal === 0) {
            zeroBalanceCount++
        }

        // Inclusion in net worth
        if (children.length > 0) {
            for (const child of children) {
                if (child.is_include_total) {
                    netWorth += Number.parseFloat(child.balance || '0')
                }
            }
        } else if (parent.is_include_total) {
            netWorth += effBal
        }

        // Breakdown by financial nature
        const cat = resolveAccountCategory(
            parent,
            typeMap.get(parent.account_type_id),
        )
        if (cat === 'bank' || cat === 'ewallet' || cat === 'cash') {
            liquidCash += effBal
        } else if (cat === 'investment') {
            investments += effBal
        } else if (cat === 'liability') {
            liabilities += effBal
        }
    }

    return {
        netWorth,
        liquidCash,
        investments,
        liabilities,
        totalParentAccounts: parents.length,
        totalPockets,
        zeroBalanceCount,
    }
}
