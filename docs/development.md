# Development workflow

## Add a route

Create a thin page in `src/routes`, register it in `src/app/router/router.tsx`, and delegate business behavior to a feature. Validate URL search parameters before use.

## Add a feature

Create `src/features/<feature>` with only the folders needed now. Keep API requests and query options under `api`, feature UI under `components`, feature hooks under `hooks`, and boundary validation under `schemas`. Export the supported surface from `index.ts`.

## Add server data

Define stable query keys per feature. Fetch through `apiClient`, validate important external responses with Zod, and consume through TanStack Query. Handle pending, background refresh, empty, error, and success states.

## Add a form

Define a Zod schema, infer its input type, connect it to React Hook Form with `zodResolver`, and display field errors beside accessible labels. Disable submission while pending and normalize backend failures.

## Add UI

Check `src/components/ui` first. Keep one-feature composition inside that feature; move it to `components/common` only after real cross-feature reuse. Preserve keyboard behavior and visible focus.

## Money Manager imports

The importer sends sequential atomic batches of up to 100 records to `POST /api/v1/transactions/batch`, including transfers. Explicit HTTP 429 responses pause the import using `Retry-After` (60 seconds when unavailable), with at most three retries per request, including account/category setup. Backend request limits remain enabled.

Only explicit validation or payload-size rejections split batches to isolate invalid rows. Connection failures, authentication failures, and server errors stop submission; ambiguous writes are not retried because the endpoint has no idempotency contract. The summary distinguishes full success from partial or stopped imports.

Category mappings use both transaction type and normalized category name. Categories are loaded across all pages in the target account owner's scope. Automatic creation is allowed only when account-type ownership is verified as the current user's; shared accounts require existing owner categories.

The completion screen offers retry for explicitly rejected or unsent rows only. It excludes successful rows and ambiguous network/server failures. Retry metadata stays in memory and does not survive a page reload.

Do not re-upload a partially imported file in full: previously committed rows can be duplicated. Reconcile existing transactions and prepare only confirmed unsaved rows before another import. An interrupted request may have committed even if the browser did not receive its response.

Before opening a pull request, run `npm run check` and `npm run build`. Run relevant Playwright flows for critical behavior.
