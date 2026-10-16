import {
    Banknote,
    Building2,
    Coins,
    CreditCard,
    Landmark,
    LineChart,
    PieChart,
    Smartphone,
    TrendingUp,
    Wallet,
} from 'lucide-react'
import type { ElementType } from 'react'
import type { AccountDto, AccountTypeDto } from '../types/account'
import { resolveAccountCategory } from './account-grouping'

export interface AccountVisualInfo {
    readonly icon: ElementType
    readonly brandBadge?: string
    readonly badgeBg: string
    readonly badgeBorder: string
    readonly badgeText: string
    readonly accentColor: string
}

/**
 * Resolves an intelligent visual representation (icon + brand color scheme)
 * for an account based on its name, type, and financial category.
 */
export function getAccountVisual(
    account: AccountDto,
    accountType?: AccountTypeDto,
): AccountVisualInfo {
    const nameLower = account.name.toLowerCase()
    const category = resolveAccountCategory(account, accountType)

    // 1. Specific Indonesian Banks
    if (nameLower.includes('bca')) {
        return {
            icon: Building2,
            brandBadge: 'BCA',
            badgeBg: 'bg-blue-50 dark:bg-blue-500/15',
            badgeBorder: 'border-blue-200 dark:border-blue-500/30',
            badgeText: 'text-blue-600 dark:text-blue-400',
            accentColor: '#3b82f6',
        }
    }
    if (nameLower.includes('mandiri')) {
        return {
            icon: Landmark,
            brandBadge: 'MDR',
            badgeBg: 'bg-amber-50 dark:bg-amber-500/15',
            badgeBorder: 'border-amber-200 dark:border-amber-500/30',
            badgeText: 'text-amber-600 dark:text-amber-400',
            accentColor: '#f59e0b',
        }
    }
    if (nameLower.includes('bni')) {
        return {
            icon: Landmark,
            brandBadge: 'BNI',
            badgeBg: 'bg-teal-50 dark:bg-teal-500/15',
            badgeBorder: 'border-teal-200 dark:border-teal-500/30',
            badgeText: 'text-teal-600 dark:text-teal-400',
            accentColor: '#14b8a6',
        }
    }
    if (nameLower.includes('bri')) {
        return {
            icon: Landmark,
            brandBadge: 'BRI',
            badgeBg: 'bg-sky-50 dark:bg-sky-600/15',
            badgeBorder: 'border-sky-200 dark:border-sky-500/30',
            badgeText: 'text-sky-600 dark:text-sky-400',
            accentColor: '#0284c7',
        }
    }
    if (nameLower.includes('bsi')) {
        return {
            icon: Landmark,
            brandBadge: 'BSI',
            badgeBg: 'bg-emerald-50 dark:bg-emerald-600/15',
            badgeBorder: 'border-emerald-200 dark:border-emerald-500/30',
            badgeText: 'text-emerald-600 dark:text-emerald-400',
            accentColor: '#10b981',
        }
    }
    if (nameLower.includes('jago')) {
        return {
            icon: Wallet,
            brandBadge: 'JAGO',
            badgeBg: 'bg-purple-50 dark:bg-purple-600/15',
            badgeBorder: 'border-purple-200 dark:border-purple-500/30',
            badgeText: 'text-purple-600 dark:text-purple-400',
            accentColor: '#a855f7',
        }
    }
    if (nameLower.includes('jenius') || nameLower.includes('btpn')) {
        return {
            icon: Landmark,
            brandBadge: 'JENIUS',
            badgeBg: 'bg-cyan-50 dark:bg-cyan-500/15',
            badgeBorder: 'border-cyan-200 dark:border-cyan-500/30',
            badgeText: 'text-cyan-600 dark:text-cyan-400',
            accentColor: '#06b6d4',
        }
    }
    if (nameLower.includes('cimb') || nameLower.includes('niaga')) {
        return {
            icon: Landmark,
            brandBadge: 'CIMB',
            badgeBg: 'bg-rose-50 dark:bg-rose-600/15',
            badgeBorder: 'border-rose-200 dark:border-rose-500/30',
            badgeText: 'text-rose-600 dark:text-rose-400',
            accentColor: '#e11d48',
        }
    }
    if (nameLower.includes('seabank')) {
        return {
            icon: Landmark,
            brandBadge: 'SEA',
            badgeBg: 'bg-orange-50 dark:bg-orange-600/15',
            badgeBorder: 'border-orange-200 dark:border-orange-500/30',
            badgeText: 'text-orange-600 dark:text-orange-400',
            accentColor: '#ea580c',
        }
    }
    if (nameLower.includes('blu')) {
        return {
            icon: Landmark,
            brandBadge: 'BLU',
            badgeBg: 'bg-sky-50 dark:bg-sky-500/15',
            badgeBorder: 'border-sky-200 dark:border-sky-400/30',
            badgeText: 'text-sky-600 dark:text-sky-400',
            accentColor: '#38bdf8',
        }
    }

    // 2. Indonesian E-Wallets
    if (nameLower.includes('gopay')) {
        return {
            icon: Smartphone,
            brandBadge: 'GOPAY',
            badgeBg: 'bg-sky-50 dark:bg-sky-500/15',
            badgeBorder: 'border-sky-200 dark:border-sky-500/30',
            badgeText: 'text-sky-600 dark:text-sky-400',
            accentColor: '#0ea5e9',
        }
    }
    if (nameLower.includes('ovo')) {
        return {
            icon: Smartphone,
            brandBadge: 'OVO',
            badgeBg: 'bg-violet-50 dark:bg-violet-600/15',
            badgeBorder: 'border-violet-200 dark:border-violet-500/30',
            badgeText: 'text-violet-600 dark:text-violet-400',
            accentColor: '#8b5cf6',
        }
    }
    if (nameLower.includes('dana')) {
        return {
            icon: Smartphone,
            brandBadge: 'DANA',
            badgeBg: 'bg-blue-50 dark:bg-blue-500/15',
            badgeBorder: 'border-blue-200 dark:border-blue-500/30',
            badgeText: 'text-blue-600 dark:text-blue-400',
            accentColor: '#3b82f6',
        }
    }
    if (nameLower.includes('shopee') || nameLower.includes('spay')) {
        return {
            icon: Smartphone,
            brandBadge: 'SPAY',
            badgeBg: 'bg-orange-50 dark:bg-orange-500/15',
            badgeBorder: 'border-orange-200 dark:border-orange-500/30',
            badgeText: 'text-orange-600 dark:text-orange-400',
            accentColor: '#f97316',
        }
    }
    if (nameLower.includes('linkaja')) {
        return {
            icon: Smartphone,
            brandBadge: 'LINK',
            badgeBg: 'bg-red-50 dark:bg-red-600/15',
            badgeBorder: 'border-red-200 dark:border-red-500/30',
            badgeText: 'text-red-600 dark:text-red-400',
            accentColor: '#ef4444',
        }
    }

    // 3. Investment Platforms
    if (nameLower.includes('bibit') || nameLower.includes('reksadana')) {
        return {
            icon: PieChart,
            brandBadge: 'BIBIT',
            badgeBg: 'bg-emerald-50 dark:bg-emerald-500/15',
            badgeBorder: 'border-emerald-200 dark:border-emerald-500/30',
            badgeText: 'text-emerald-600 dark:text-emerald-400',
            accentColor: '#10b981',
        }
    }
    if (
        nameLower.includes('stockbit') ||
        nameLower.includes('saham') ||
        nameLower.includes('ajaib')
    ) {
        return {
            icon: LineChart,
            brandBadge: 'SAHAM',
            badgeBg: 'bg-indigo-50 dark:bg-indigo-500/15',
            badgeBorder: 'border-indigo-200 dark:border-indigo-500/30',
            badgeText: 'text-indigo-600 dark:text-indigo-400',
            accentColor: '#6366f1',
        }
    }
    if (
        nameLower.includes('crypto') ||
        nameLower.includes('binance') ||
        nameLower.includes('tokocrypto') ||
        nameLower.includes('pintu')
    ) {
        return {
            icon: Coins,
            brandBadge: 'CRYPTO',
            badgeBg: 'bg-amber-50 dark:bg-amber-500/15',
            badgeBorder: 'border-amber-200 dark:border-amber-500/30',
            badgeText: 'text-amber-600 dark:text-amber-400',
            accentColor: '#f59e0b',
        }
    }

    // 4. Fallback by Financial Category
    switch (category) {
        case 'bank':
            return {
                icon: Landmark,
                badgeBg: 'bg-blue-50 dark:bg-blue-500/15',
                badgeBorder: 'border-blue-200 dark:border-blue-500/30',
                badgeText: 'text-blue-600 dark:text-blue-400',
                accentColor: '#3b82f6',
            }
        case 'ewallet':
            return {
                icon: Smartphone,
                badgeBg: 'bg-cyan-50 dark:bg-cyan-500/15',
                badgeBorder: 'border-cyan-200 dark:border-cyan-500/30',
                badgeText: 'text-cyan-600 dark:text-cyan-400',
                accentColor: '#06b6d4',
            }
        case 'cash':
            return {
                icon: Banknote,
                badgeBg: 'bg-emerald-50 dark:bg-emerald-500/15',
                badgeBorder: 'border-emerald-200 dark:border-emerald-500/30',
                badgeText: 'text-emerald-600 dark:text-emerald-400',
                accentColor: '#10b981',
            }
        case 'investment':
            return {
                icon: TrendingUp,
                badgeBg: 'bg-amber-50 dark:bg-amber-500/15',
                badgeBorder: 'border-amber-200 dark:border-amber-500/30',
                badgeText: 'text-amber-600 dark:text-amber-400',
                accentColor: '#f59e0b',
            }
        case 'liability':
            return {
                icon: CreditCard,
                badgeBg: 'bg-rose-50 dark:bg-rose-500/15',
                badgeBorder: 'border-rose-200 dark:border-rose-500/30',
                badgeText: 'text-rose-600 dark:text-rose-400',
                accentColor: '#f43f5e',
            }
        default:
            return {
                icon: Wallet,
                badgeBg: 'bg-slate-100 dark:bg-slate-700/20',
                badgeBorder: 'border-slate-200 dark:border-slate-700/40',
                badgeText: 'text-slate-600 dark:text-slate-300',
                accentColor: '#94a3b8',
            }
    }
}
