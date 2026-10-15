# Account details

**Lihat detail akun** beside a main account or child opens the protected `/accounts/$accountId` page, not an info dialog. The parameter must be a UUID. The eye icon remains a separate visibility action; **Kembali ke akun** returns to the list.

The header shows name, description, currency, parent context and the account's own authoritative balance, never the aggregate child balance.

Main accounts and pockets each have a **Masuk total / Tidak masuk total** toggle. It updates only `is_include_total` with the current account version. Net worth uses this flag independently of `is_visible`: hiding an account does not exclude its balance, and excluding a parent does not automatically exclude its pockets. Visibility controls dashboard cards only. Asset allocation also honors inclusion while retaining its root-account-only breakdown.

The page reuses `TransactionsView` with a locked `account_id` filter. Main accounts show only their own transactions, not a subtree; child accounts use their exact ID. Transactions load in pages of 50 with API pagination metadata, loading, retryable error and empty states. Type/category filters reset pagination. Description search and CSV export cover the current page only.

There is no backend GET account detail endpoint: the detail query walks the existing account collection in bounded pages of 100 until it finds the account and parent, or exhausts the collection. Missing accounts and dependency failures have explicit states.

Regression coverage: account list navigation and account detail scoped requests, pagination, context and error/empty states in `src/routes/accounts-page.test.tsx` and `src/routes/account-detail-page.test.tsx`.
