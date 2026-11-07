# Credit Cards — Simplified Web Delivery Plan

Status: simple web implementation in progress. Existing account, expense and transfer flows support explicit credit-card metadata; no billing module or queue is introduced.

Canonical requirements: **CC-PRD-01**, `vesper-be/docs/credit-cards-prd.md`. Backend and mobile companion plans are `docs/credit-cards-implementation.md` in their respective repositories; these identifiers are not deployed links.

## Scope and accounting

Extend existing account, transaction and transfer flows; do not create a credit-card module, dedicated commands, new storage or offline queue. Purchases are normal EXPENSE; repayment is the existing atomic bank-to-card TRANSFER. Manual fees/posted interest are ordinary EXPENSE; a bank fee, if recorded, is separate from principal.

- Account `is_credit_card` defaults false. Explicit new cards retain compatible CASH classification; CASH/INVESTMENT enums do not change. Nullable `credit_limit` is a positive exact decimal string when supplied; null means untracked.
- For exact signed balance B: debt = max(-B, 0), overpayment credit = max(B, 0). For tracked L, remaining contractual limit = L - debt, not L + B, including negative results.
- Over-limit purchase and lower-limit edits remain allowed. Overpayment has nonblocking information only, no extra confirmation gate.
- Positive B is “Kelebihan Bayar”, consumed by subsequent ordinary expenses, never forfeited or automatically refunded by the issuer. Do not promise additional issuer capacity.
- Statements, installments, specialized refunds, issuer cash refunds, cash advances, reminders, imports and automated billing/interest are out of scope, not later phases.

## Minimal delivery tasks

### WEB-01 Existing account contracts and forms

- Extend account API schemas/types and React Hook Form/Zod create/edit forms with the flag and optional limit. Preserve decimal balance/limit strings and opaque version strings; use exact arithmetic, never Number/parseFloat for money.
- Use explicit metadata rather than account-name heuristics for accounting. Preserve compatible parsing/defaults for older responses and round-trip fields without accidental clearing.
- Offer only private, own, IDR leaf cards and same-owner bank payment sources. Backend authorization is authoritative; do not offer group sharing.
- Keep existing obligation-mapped accounts locked. No conversion, name-based reclassification, mapping edits or history rewrite.
- Create at zero balance if no safe opening representation exists; defer opening-debt input rather than fabricate transactions.
- Do not request PAN, CVV, PIN, expiry or bank credentials. Preserve centralized client/auth, protected routes and safe errors; add no financial payload/token persistence.

### WEB-02 Purchases, repayment and presentation

- Reuse existing purchase/transfer forms, APIs and replay/version handling, with duplicate-submit protection. No dedicated card endpoints or command recovery store.
- Show “Utang Terpakai”, “Sisa Limit”, “Limit Tidak Dipantau” for null limits, and “Kelebihan Bayar” separately. Explain that limits and overpayments are not liquid cash.
- Repayment records an external action: “Pencatatan ini tidak melakukan pembayaran ke bank.” Show any overpayment information without blocking save or adding a confirmation gate.
- A timeout is not proof of rejection; retain existing request identity/reconciliation behavior rather than blindly submitting another payment.
- Keep TanStack Query, existing query keys, centralized Axios and RHF/Zod. After confirmed mutations selectively invalidate accounts, transactions, dashboard, budgets and net worth as affected. No new global state manager or queue.
- Provide loading/error/empty/pending states, safe Indonesian feedback, keyboard focus and accessible labels; check small/desktop viewports and avoid color-only financial status.

### WEB-03 Reporting and compatibility

- Exclude limits and positive card overpayments from liquid cash/emergency funds despite CASH classification.
- Count signed B in net worth once under inclusion settings and existing obligation mappings: debt when negative, non-liquid asset when positive. Never add a second liability or rewrite historical snapshots.
- Count purchases/manual charges in spending and budgets once; principal transfers are neither income nor expense.
- Coordinate account migration/API/sync compatibility with backend/mobile. Enable creation only after contract checks; disabling creation preserves existing reads/history and mobile pending work.

## Required tests and release gates

- Schema/unit: false defaults, null/positive limits, exact fractions, large version strings, explicit identity, remaining limit and reporting classification.
- Component/regression: zero-balance setup, mapped-account lock, sharing refusal, normal expense/transfer forms, lower-limit edit, over-limit purchase, nonblocking overpayment, duplicate submit, uncertain outcome and targeted query invalidation.
- Shared fixture: B = -2000000.00 → pay 2500000.00 → B = 500000.00 → spend 200000.00 → B = 300000.00 → spend 400000.00 → B = -100000.00. Credit is consumed without forfeiture or automatic refund.
- Limit fixture: L = 1000000.00 and debt = 1200000.00 displays -200000.00; null remains untracked. Verify liquidity exclusion, signed net worth once and principal excluded from spending.
- Critical E2E: create → purchase → repayment/overpayment → subsequent expense, including authorization, lost-response recovery using existing behavior, responsive layout and keyboard access. Backend owns atomic rollback/replay tests.

## Delivery notes and remaining release checks

- Account collection and detail reads default omitted metadata to false/null. Create and limit edits preserve exact decimal strings and opaque versions; unrelated edits omit limit fields rather than clearing them.
- Card summaries and account totals use integer minor units. Positive overpayments remain signed net-worth assets but are excluded from liquidity and debt totals. Cards are excluded from group sharing/pockets, investment funding and Money Manager mapping.
- Purchases remain EXPENSE and repayments remain TRANSFER. Card creation sends no opening balance. Subtype conversion and obligation mapping edits are not offered.
- Duplicate submission is guarded in memory. The existing web endpoints expose no client replay identity/recovery contract; an uncertain result stops resubmission in that form and asks the user to reconcile history and balances. Closing/reloading is not durable replay protection; no queue or recovery storage was added.
- Backend migration, private/unmapped card invariants, bank-source authorization, liquidity/emergency-fund server reports and atomic settlement remain backend responsibilities. The current web account DTO has no obligation-mapping or sharing metadata; existing unflagged mapped accounts are not converted or made limit-editable.
- Run lint, typecheck, tests, targeted formatting and production build for this delivery. Critical authenticated flows against a compatible real backend remain release gates.

## Verification recorded 2026-11-07

- Web typecheck, repository lint and production build passed; Vitest passed 35 files / 220 tests. The build retains a non-fatal chunk-size warning.
- The unchanged `e2e/credit-cards.spec.ts` passed both 390px and 1280px scenarios using installed Windows Chrome via Windows Node, with `chromiumSandbox: true`. Tests verified mocked card summaries and keyboard limit editing; all API responses were mocked. This is not evidence of real backend settlement or mobile synchronization.
- Linux Chromium cannot launch because `libnspr4.so` is missing. Existing Windows Chrome provided browser verification without installing system packages or weakening sandbox settings. A temporary configuration outside the repository reused the existing server; no product browser configuration was changed.
- Latest independent mobile verification passed `flutter analyze` with no issues and all 676 Flutter tests. These are separate test suites, not a cross-platform live integration run.
- No persistent migration, deployment, real-account financial mutation, or database/container cleanup was performed. Real authenticated backend/web/mobile integration and approved persistent migration remain release gates.
