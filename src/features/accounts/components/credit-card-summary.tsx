import { creditCardSummary, formatExactRupiah } from '../utils/credit-card'
import type { AccountDto } from '../types/account'

export function CreditCardSummary({ account }: { account: AccountDto }) {
    const summary = creditCardSummary(
        account.balance,
        account.credit_limit ?? null,
    )
    return (
        <dl className="space-y-1 text-xs">
            <div>
                <dt className="inline">Utang Terpakai: </dt>
                <dd className="inline font-mono">{formatExactRupiah(summary.debt)}</dd>
            </div>
            <div>
                <dt className="inline">Sisa Limit: </dt>
                <dd className="inline font-mono">
                    {summary.remaining === null
                        ? 'Limit Tidak Dipantau'
                        : formatExactRupiah(summary.remaining)}
                </dd>
            </div>
            <div>
                <dt className="inline">Kelebihan Bayar: </dt>
                <dd className="inline font-mono">
                    {formatExactRupiah(summary.overpayment)}
                </dd>
            </div>
        </dl>
    )
}
