# Dashboard periods

The dashboard stores `period`, `value` (from), and `end_value` (through, inclusive) in URL search parameters. Supported formats for both endpoints are `daily` / `YYYY-MM-DD`, `monthly` / `YYYY-MM`, and `yearly` / `YYYY`, with real calendar dates and years 1000–9998. The end must be on or after the start. Older URLs and callers without `end_value` resolve it to `value`. Missing or invalid ranges resolve together to the current month in Asia/Jakarta (WIB). Browser back/forward navigation restores both endpoints.

The compact responsive panel uses accessible pressed-state period buttons and labeled custom from/to picker triggers, with Indonesian formatted selections and one calendar icon each. The dark dialog offers a Monday-first day calendar, twelve-month grid, and paged twelve-year grid. Day-calendar month/year headers allow quick navigation through the year and month grids. Navigation is bounded to 1000–9998; only valid calendar days are selectable. Keyboard users can Tab through buttons, close with Escape, and return focus to the trigger. Changes remain local drafts until **Terapkan**; selections and switching periods do not navigate or fetch. Switching period resets both draft endpoints to the current WIB period. Invalid or reversed drafts display associated inline errors and disable application. URL navigation replaces the draft. The dashboard describes the applied range in human-readable Indonesian rather than raw date codes.

Income, expenses, and net cash flow come from `GET /dashboard/summary` through the authenticated API client. Requests always send resolved `period`, `value`, and `end_value`; the response always includes `end_value`. Zod validates the response. These totals cover all matching transactions, not just the visible feed. Loading and errors do not display fabricated zero totals; failed requests offer a retry.

The latest feed requests seven transactions ordered by descending transaction time. Its range uses WIB midnight at `value` converted to UTC, through the entire `end_value` period. The exclusive boundary is one day/month/year after `end_value`. The summary end is exclusive; the transaction-list end is inclusive, so the feed subtracts one millisecond from the exclusive boundary.

Net worth, account balances, and asset allocation remain current snapshots and are not filtered by the selected period. Budgets and instruments also remain unaffected.

Transaction creation, edits, deletion, transfers, investment transactions, and Money Manager imports invalidate dashboard summaries. Investment transactions also invalidate the latest transaction feed.

Tests are colocated under `src/features/dashboard`: calendar boundaries, leap dates, supported years, WIB defaults, and accessible filter behavior.
