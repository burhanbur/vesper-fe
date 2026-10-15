import type { AccountDto } from '@/features/accounts/types/account'

/** Inclusion is independent of visibility and of the parent's settings. */
export function includedDashboardAccounts(
    accounts: AccountDto[],
): AccountDto[] {
    return accounts.filter(
        (account) => account.is_include_total && !account.deleted_at,
    )
}

/** A hidden parent hides its pockets on the dashboard too. */
export function visibleDashboardAccounts(accounts: AccountDto[]): AccountDto[] {
    const excluded = new Set(
        accounts
            .filter((account) => !account.is_visible || account.deleted_at)
            .map((account) => account.id),
    )
    let changed = true
    while (changed) {
        changed = false
        for (const account of accounts) {
            if (
                account.parent_account_id &&
                excluded.has(account.parent_account_id) &&
                !excluded.has(account.id)
            ) {
                excluded.add(account.id)
                changed = true
            }
        }
    }
    return accounts.filter((account) => !excluded.has(account.id))
}
