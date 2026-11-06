# Credit Cards — Web Product and Delivery Plan

Status: draft; documentation only, not an implemented feature.

Canonical product requirements: **CC-PRD-01**, `vesper-be/docs/credit-cards-prd.md` in the backend repository. When the standard sibling checkout exists, open [the canonical PRD](../../vesper-be/docs/credit-cards-prd.md). The path is a development convenience, not a deployed documentation URL. Backend contract changes must update this plan and the mobile plan in the same delivery.

## Product scope

Support explicit, owner-private IDR credit cards rather than guessing liabilities from names. Phase 1 covers setup/opening debt, purchases, posted interest/fees, linked refunds, bank-to-card payments, reversals, exact summary and history. Phase 2 adds statement snapshots, due dates, allocation and reminders; Phase 3 adds installment tracking without repeating purchase expenses. Imports and advanced servicing require separate approval.

A payment records an external action; Vesper does not initiate a bank payment. Credit limit is never income, a cash balance or a net-worth asset. Card credit after overpayment is non-liquid, not spending money.

## Verified baseline

- `src/features/accounts/types/account.ts`: CASH/INVESTMENT contracts and string balances/versions.
- `src/features/accounts/utils/account-grouping.ts`: keyword-based liability grouping, insufficient as an authorization/accounting signal.
- `src/features/transactions/types/transaction.ts`: INCOME/EXPENSE/TRANSFER contracts.
- `src/app/router/router.tsx`: existing authenticated account and transaction routes; no dedicated card route.
- `src/lib/api-client.ts` and `src/features/auth/api/`: centralized requests and session coordination.
- TanStack Query manages server state. Web has no mobile-style durable financial outbox.

Do not introduce a global state manager, new auth storage, or an offline queue for this feature.

## Proposed feature structure

Create `src/features/credit-cards/` with `api/`, `schemas/`, `hooks/`, `components/`, `utils/` and public `index.ts` only as files are needed. Keep `src/routes/` thin. Reuse shadcn primitives, RHF/Zod, centralized Axios and stable feature query keys. API schemas validate exact decimal strings and opaque versions; use exact arithmetic for previews, never Number/parseFloat for financial calculations.

Route proposals: `/credit-cards`, `/credit-cards/$cardId`; add statement detail only in Phase 2. Validate UUID params/search and reuse existing authenticated guards. Server authorization remains authoritative.

## User experience and acceptance

| Surface          | Required behavior                                                                                                   |
| ---------------- | ------------------------------------------------------------------------------------------------------------------- |
| Card list        | Outstanding, credit balance if positive, available credit, over-limit status and empty/loading/error states         |
| Setup            | Name, optional issuer/last four, positive limit, optional opening debt/credit and as-of time; no PAN/CVV/expiry     |
| Card detail      | Exact balance, confirmed timestamp, history, permitted actions, reconciliation references                           |
| Purchase/charge  | Category and exact amount; unsupported cash advance/income actions unavailable and server-rejected                  |
| Refund           | Select original purchase, show refundable remainder, prevent over-refund, distinguish refund from income            |
| Payment          | Owned IDR cash source, principal, optional bank fee/category, projected balances, explicit overpayment confirmation |
| Recovery         | Preserve command identity after timeout; resolve accepted/rejected/unknown outcome before offering a new payment    |
| Statements later | Frozen totals and lines, remaining due, explicit issuer minimum, local calendar dates, payment allocations          |

Use copy such as “Utang Terpakai”, “Sisa Limit”, “Saldo Kredit”, and “Bayar Kartu”. Confirmation MUST say “Pencatatan ini tidak melakukan pembayaran ke bank.” Never imply remaining limit is liquid cash. Pending submission and background fetching differ visually. Disable duplicate submit; announce validation and mutation results accessibly.

Test keyboard focus, dialog errors, screen-reader labels, narrow mobile viewport and desktop. Do not use color alone for debt, over-limit or sync state. Use existing semantic tokens rather than a new visual system.

## Delivery sequence

### WEB-00 Contract readiness

Approve canonical PRD decisions. Add fixtures for explicit LIABILITY/CREDIT_CARD metadata and decimal/refund semantics. Define backend capability detection and safe old-server behavior before enabling routes. Do not let a strict enum response crash existing accounts pages after server rollout.

### WEB-01 Read-only integration

Implement feature API schemas, query keys, card list/detail and account links. Replace keyword-based authority only when explicit server metadata exists. Unknown legacy cards show a migration-needed state rather than being silently converted. Keep positive card credits out of liquid totals and do not aggregate parent pockets into a card.

### WEB-02 Mutations and recovery

Implement forms and dedicated command API, one stable command UUID per reviewed submission. Reuse the UUID after timeout/retry. For reload recovery, specify a minimal application-scoped pending-command reference store containing only command ID and recovery state; no raw financial payload, tokens, PII or query-cache snapshots. Add this storage only after security review. The server must expose an owner-authorized way to resolve that reference before a new payment is offered. If recovery cannot be guaranteed, block uncertain repeat submission and show the support reference.

Transport failure is not evidence of rejection. Never silently create a new command or change its expected version. Reversal is distinct from cancellation. Financial command responses must use the canonical envelope and safe Indonesian errors.

After confirmed success selectively invalidate card, accounts, transactions, dashboard, budget and net-worth data. Query functions fetch/validate/map; they do not emit toasts. Preserve the existing 401 refresh contract and do not clear valid auth for 403.

### WEB-03 Advanced phases

Add frozen statements/allocation views and explicitly configured calendar dates, then installments. Do not locally invent issuer minimum due, automatic fees or scheduled expense postings. No offline statement close or web offline write promise.

## Test plan and release gates

- Unit: API schemas, decimal previews, summary classification, card credit and over-limit, stable query keys.
- Component: setup, partial payment, fee, refund bounds, overpayment confirmation, no double submit, stale versions, capability-disabled and unknown-result recovery.
- Regression: existing account grouping/detail, transaction forms, transfer forms, protected route behavior and cache invalidation.
- Playwright: create → purchase → partial pay → refund → reverse; reload after lost payment response; unauthorized card; responsive keyboard flow.
- Shared numeric fixture: purchase 500000, pay 300000, card fee 25000 → debt 225000, spending 525000, bank reduced 300000. Payment must not increase expense.

Run relevant tests first, then `npm run check`, `npm run build`, and critical `npm run test:e2e` flows. Confirm current scripts in `package.json`; report actual results. Do not claim these checks ran for this documentation-only delivery.

Release depends on gated backend commands/read contracts and compatible mobile reads/reconciliation. Feature disablement retains read/recovery access. No existing public account/history route is removed.
