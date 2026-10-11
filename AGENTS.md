# AGENTS.md

This guide is the primary source of rules for humans and AI working on the **React Starter Kit** repository. When the rules here differ from personal assumptions, follow this document. The repository may currently be incomplete; the structure below is the target architecture that must be built and maintained incrementally.

## 1. Project Goals

This starter kit is intended for modern React applications that are:

- ready to serve as the foundation for production applications;
- easy for junior developers to understand and maintain;
- type-safe, accessible, responsive, and easy to test;
- structured to separate UI, business logic, API access, and configuration;
- free from premature abstractions and unnecessary dependencies;
- consistent in their patterns for routing, server state, forms, tables, and error handling.

## 2. Core Principles

1. **Simple first** — choose the simplest implementation that meets the requirements.
2. **Feature-oriented** — group business code by feature, not by global file type.
3. **Reusable with purpose** — extract components after real reuse exists, not because they might be used later.
4. **Type-safe end-to-end** — avoid `any`, validate external data, and define contracts clearly.
5. **Server state is not client state** — manage API data with TanStack Query; keep local UI state local.
6. **Accessible by default** — use semantic HTML and shadcn/Radix primitives correctly.
7. **Explicit over magic** — naming, dependencies, and data flow must be easy to trace.
8. **Test behavior** — test user behavior and important contracts, not implementation details.
9. **Secure by default** — do not expose secrets, trust external input, or render raw HTML without sanitization.
10. **Keep the main branch healthy** — changes must pass relevant formatting, linting, type-checking, and tests.

## 3. Standard Stack

Use the latest stable versions that are compatible with one another. Pin dependencies through `package-lock.json`; do not change major versions without reviewing the migration guide.

### Core

- **React** + **TypeScript** — UI and type safety.
- **Vite** — development server and production build.
- **npm** — the sole package manager.
- **Tailwind CSS** — utility-first styling.
- **shadcn/ui** + **Radix UI** — accessible UI primitives owned directly by the codebase.
- **Lucide React** — the default icon library.

### Application

- **TanStack Router** — type-safe routing and route-based code splitting.
- **TanStack Query** — server state, caching, retries, mutations, and invalidation.
- **TanStack Table** — complex tables; do not use it for simple static tables.
- **React Hook Form** + **Zod** — form state and schema validation.
- **Axios** — a centralized HTTP client with timeout/interceptors. Native `fetch` is acceptable for small needs that do not use the primary client.
- **Sonner** — toast notifications.
- **date-fns** — date manipulation.
- **clsx** + **tailwind-merge** through the `cn()` helper — class composition.

### Quality and Testing

- **ESLint** — static analysis.
- **Prettier** + Tailwind plugin — formatting and utility class ordering.
- **Vitest** — unit/integration tests.
- **React Testing Library** + **user-event** — component tests.
- **MSW** — API mocks in tests/development when needed.
- **Playwright** — end-to-end tests for critical flows.
- **Husky** + **lint-staged** — staged-file checks; hooks must remain fast.

Do not add a global state manager by default. Add **Zustand** only when cross-feature client state cannot be handled effectively with local state, context, URL search params, or TanStack Query.

## 4. Target Folder Structure

```text
.
├── .env.example
├── .github/
│   └── workflows/                 # CI checks
├── docs/                          # Extended documentation
├── e2e/                           # Playwright specs and fixtures
├── public/                        # Static assets served as-is
├── src/
│   ├── app/
│   │   ├── providers/             # Query, router, theme, and error providers
│   │   ├── router/                # Router configuration and route tree
│   │   ├── App.tsx                # Root component when needed
│   │   └── main.tsx               # The sole browser entry point
│   ├── assets/                    # Assets processed by the bundler
│   ├── components/
│   │   ├── ui/                    # Reusable, business-agnostic shadcn components
│   │   ├── common/                # Cross-feature components
│   │   └── layout/                # Header, sidebar, shell, and page layout
│   ├── config/                    # Validated environment and application configuration
│   ├── features/
│   │   └── example/
│   │       ├── api/               # Requests, query options, and mutations
│   │       ├── components/        # Feature-specific UI
│   │       ├── hooks/             # Feature-specific hooks
│   │       ├── schemas/           # Feature input/response schemas
│   │       ├── types/             # Feature-specific types when they cannot be inferred
│   │       ├── utils/             # Feature-specific pure helpers
│   │       └── index.ts            # Feature public API
│   ├── hooks/                     # Reusable cross-feature hooks
│   ├── lib/                       # Technical library/client integrations
│   │   ├── api-client.ts
│   │   ├── query-client.ts
│   │   └── utils.ts
│   ├── routes/                    # Thin page/route definitions
│   ├── styles/                    # Global CSS and design tokens
│   ├── test/                      # Global test setup, mocks, and render helpers
│   ├── types/                     # Truly general global/shared types
│   └── vite-env.d.ts
├── components.json                # shadcn/ui configuration
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── playwright.config.ts
├── prettier.config.js
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
└── vitest.config.ts
```

### Placement Rules

- `src/components/ui`: generic UI primitives only; must not import from `features`.
- `src/components/common`: cross-feature components containing limited application composition.
- `src/features/<feature>`: all domain logic for a feature. A feature must not access another feature's internals; import only from its public `index.ts` API when genuinely necessary.
- `src/routes`: connects URLs to features. Routes must remain thin and must not contain substantial business logic.
- `src/lib`: technical configuration/integrations, not a collection of miscellaneous helpers.
- `src/hooks`: hooks used across features only. A feature-specific hook remains within that feature.
- `src/types`: global types only. Prefer inference from Zod, function return values, and API contracts.
- Colocate tests near their files as `*.test.ts` or `*.test.tsx`; global test helpers belong in `src/test`.
- Use the `@/` alias for `src/`; avoid relative imports that traverse more than two levels.

## 5. File and Naming Conventions

- General folders and files: `kebab-case`.
- Components/types/interfaces: `PascalCase`.
- Functions, hooks, and variables: `camelCase`.
- Truly constant values: `UPPER_SNAKE_CASE`.
- Hook names always begin with `use`.
- Internal event handlers begin with `handle`; callback props begin with `on`.
- Booleans use meaningful prefixes: `is`, `has`, `can`, or `should`.
- Tests: `<file-name>.test.ts(x)`; E2E: `<flow>.spec.ts`.
- Avoid unclear names such as `data`, `item`, `utils`, or `helpers` when the context is not immediately apparent.
- A file should have one primary responsibility. There is no rigid line limit, but split a file when it becomes difficult to understand or test.

## 6. TypeScript and React Rules

- Enable TypeScript strict mode.
- Do not use `any`; use `unknown`, then narrow or validate it.
- Avoid type assertions (`as`) except at verified integration boundaries.
- Use `import type` for type-only imports.
- Prefer named exports. Use default exports only when required by a framework/tool.
- Components must be function components. Do not use `React.FC` unless there is a specific reason.
- Define props near the component and name them `<ComponentName>Props`.
- Do not store derived state; calculate it from source state during render.
- Do not use `useEffect` for state calculations that can be performed directly.
- Do not make manual API requests in components when they can be modeled as queries/mutations.
- Use lazy loading for large pages/features, not small components without a clear benefit.
- Use memoization only when there is evidence of a rendering/performance issue, not by default.
- Error/loading/empty states must be considered for every data-driven UI.
- Error boundaries must be available at the appropriate application/route level.

## 7. Reusable Components

Use this decision order when creating UI:

1. Look for an existing primitive in `components/ui`.
2. Compose it within the feature if only that feature uses it.
3. Move it to `components/common` after it is genuinely used across features.
4. Add variants using the pattern employed by shadcn/CVA, rather than continually adding boolean props.

Requirements:

- Presentational components receive data and callbacks through props.
- Place business logic in feature hooks/services, not UI primitives.
- Wrappers must provide clear added value; do not wrap a component merely to rename it.
- Use composition and `children` instead of oversized prop configurations.
- Forward `className` when consumers need additional styling, then merge it with `cn()`.
- Preserve keyboard navigation, focus states, labels, ARIA attributes, and contrast.
- Do not edit dependencies in `node_modules`; shadcn components in `src/components/ui` may be edited.

## 8. Routing

- All routes use TanStack Router.
- URL paths, path params, and search params are the state source for navigation/filters that need to be shared or preserved across refreshes.
- Validate search params with a schema.
- Use route loaders only for navigation-related orchestration/prefetching; TanStack Query continues to manage the data cache.
- Protected pages must use a guard before rendering sensitive content.
- Provide a not-found page and route-level error states.
- Route components serve as composition layers and delegate details to features.

## 9. API and TanStack Query

### HTTP Client

- Route all application requests through `src/lib/api-client.ts` or a feature wrapper that uses that client.
- The base URL comes from validated environment configuration.
- Set a timeout and normalize errors into a consistent application shape.
- Do not log tokens, passwords, sensitive responses, or PII.
- Authentication handling must be centralized in the API client.
- Follow the backend authentication contract in `express-starter-kit`: login returns `access_token` and `refresh_token` in JSON, protected requests use `Authorization: Bearer <access_token>`, and refresh sends `{ "refresh_token": "<refresh_token>" }` in the JSON body.
- Keep the access JWT only in runtime memory. Persist only the refresh JWT in `localStorage` under one application-scoped key so the session can be restored after reload or reopening the browser. Never persist either token in TanStack Query, application-state snapshots, URLs, logs, analytics, or error messages.
- Treat the refresh JWT as a sensitive credential. Read and write it only through a small centralized token-storage module; feature code and components must not access browser storage directly.
- On application bootstrap, if a refresh JWT exists, make one refresh request before deciding the authentication state. Keep the application in an authentication-restoring state until it completes; do not briefly render or redirect to the login page while restoration is pending.
- A successful login or refresh must replace the in-memory access JWT and persist the newly returned refresh JWT. Because refresh rotation invalidates the previous access and refresh tokens, never retain or reuse an older token pair.
- Centralize refresh coordination. On an eligible `401`, run at most one shared refresh request for concurrent failures, replace both tokens, and retry each original request once. Never recursively refresh login, refresh, or logout requests and never create a retry loop.
- Coordinate token rotation across same-origin tabs so two tabs cannot reuse the same refresh JWT. Use a cross-tab lock for refresh and notify other tabs of token updates or logout; each tab must keep its runtime access JWT synchronized with the latest rotation.
- The backend Redis session and JWT expirations are authoritative. Successful refresh resets the refresh expiry according to the backend TTL; explicit logout, revocation, refresh-token reuse, user deactivation, or expiry ends the session.
- If bootstrap or automatic refresh reports an expired, revoked, reused, or otherwise invalid session, remove the persisted refresh JWT, clear in-memory authentication state and protected query caches, then continue to the login flow. Handle `403` as an authenticated user lacking permission without clearing a valid session.
- Authentication does not use cookies or CSRF tokens. Do not enable Axios `withCredentials` for this token flow unless a separate endpoint explicitly requires cookies.
- Logout must call the backend with the current access Bearer token so it can revoke that Redis session, then clear both local tokens and protected query caches even if the network request fails.
- Frontend route guards and token contents are only for UX; they must not be treated as proof of authorization.
- Do not store server secrets in the frontend application. All Vite variables sent to the browser are public.

### Query

- Query keys must be stable, serializable, and defined through a per-feature query-key factory.
- Query functions only fetch, validate, and map data; do not trigger toasts from query functions.
- Configure `staleTime`, retries, and refetching based on the nature of the data, rather than copying defaults without consideration.
- After a mutation, update the cache selectively or invalidate the relevant query key.
- Use optimistic updates only when rollback and error states are handled.
- Use `enabled` for query dependencies; do not call hooks conditionally.
- Distinguish initial loading (`isPending`) from background refresh (`isFetching`) in the UX.

Recommended dependency flow example:

```text
route/page -> feature hook -> TanStack Query -> feature API -> api-client -> backend
```

## 10. Forms and Validation

- Use React Hook Form for non-trivial forms and Zod as the validation schema source.
- Infer form types from the schema; do not write duplicate types.
- Separate domain schemas from UI labels/help text when possible.
- Display errors near fields and provide an error summary for long forms.
- Submit buttons must have a pending state and prevent duplicate submissions.
- Map API payloads in the feature layer, not across field components.
- Frontend validation improves UX, but the backend remains the authority for security/data.
- Use accessible shadcn field components with explicit labels.

## 11. Styling and Design System

- Use Tailwind and semantic design tokens; avoid hard-coded colors when tokens are available.
- Use a mobile-first approach. Test at minimum on small and desktop viewports.
- Use `cn()` for conditional classes.
- Avoid inline styles unless values are genuinely dynamic and impractical to express with Tailwind.
- Do not repeat arbitrary values; turn them into shared tokens/utilities.
- Dark mode must use a class/theme provider when enabled.
- All interactive elements must have appropriate hover, focus-visible, disabled, and loading states.
- Animations must be brief, unobtrusive, and respect `prefers-reduced-motion`.
- Give decorative icons `aria-hidden`; icon buttons must have an accessible name.

## 12. Environment and Configuration

### Environment Files

```text
.env.example       # Safe template; must be committed to Git
.env                # Local default; do not commit if it contains local values
.env.local          # Local override; do not commit
.env.development    # Non-secret development values when needed
.env.production     # Non-secret production values when needed
.env.test           # Non-secret test values
```

Rules:

- Only variables prefixed with `VITE_` may be accessed by the client through `import.meta.env`.
- Assume all `VITE_*` values are visible to users; **never put secrets/private API keys in them**.
- Document all variables in `.env.example` with safe dummy values.
- Access environment configuration only through `src/config/env.ts`; validate it once with Zod at startup.
- Components/features must not read `import.meta.env` directly.
- Add each new variable together with its schema, `.env.example` entry, and documentation.

Planned minimum contract:

```dotenv
VITE_APP_NAME=React Starter Kit
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_ENV=development
VITE_ENABLE_MOCKS=false
```

`VITE_APP_ENV` must be restricted to `development | test | staging | production`. Do not rely on this string alone for security decisions.

## 13. Development and Preview Ports

Default ports:

- Development: `5173`
- Production build preview: `4173`

Configure them in `vite.config.ts`:

```ts
server: {
  host: true,
  port: 5173,
  strictPort: true,
},
preview: {
  host: true,
  port: 4173,
  strictPort: true,
}
```

To override them temporarily without changing the file:

```text
npm run dev -- --port 3000
npm run preview -- --port 8080
```

Use `strictPort: true` so port failures are clearly visible and the application does not silently switch ports. Do not hard-code the development origin in source code; use environment/configuration values.

## 14. Scripts and Running the Application

`package.json` must provide at least:

| Command                 | Purpose                                                      |
| ----------------------- | ------------------------------------------------------------ |
| `npm install`           | Install dependencies and update the lockfile when needed     |
| `npm ci`                | Reproduce dependencies exactly from the committed lockfile   |
| `npm run dev`           | Run the development server                                   |
| `npm run build`         | Type-check and then create a production build                |
| `npm run preview`       | Run the built application locally                            |
| `npm run lint`          | Run ESLint                                                   |
| `npm run lint:fix`      | Fix safe lint issues                                         |
| `npm run format`        | Format supported source files                                |
| `npm run format:check`  | Verify formatting without changing files                     |
| `npm run typecheck`     | Run TypeScript without emitting output                       |
| `npm test`              | Run Vitest                                                   |
| `npm run test:coverage` | Run tests with coverage                                      |
| `npm run test:e2e`      | Run Playwright                                               |
| `npm run check`         | Run linting, type-checking, unit tests, and the format check |

First-time setup:

1. Ensure the Node.js LTS version specified in `.nvmrc`/`package.json#engines` is active.
2. Ensure the npm version required by `package.json#engines` is active.
3. Copy `.env.example` to `.env.local`.
4. Run `npm install`.
5. Run `npm run dev`.
6. Open `http://localhost:5173`.

Use `npm`; commit `package-lock.json` and do not commit `pnpm-lock.yaml` or `yarn.lock`. CI uses `npm ci`.

## 15. Testing Strategy

Use a pragmatic testing pyramid:

- **Unit**: pure functions, mappers, schemas, formatters, and complex logic.
- **Component/integration**: component interactions, forms, loading/error/empty states, and feature integrations.
- **E2E**: a small number of the most critical business flows, such as login and primary transactions.

Rules:

- Test what users see and do; prioritize queries by role, label, or text.
- Avoid large snapshots and tests that depend on Tailwind classes.
- Mock network boundaries with MSW, not internal hook/library details.
- Tests must be deterministic; do not depend on real networks, real time, or test order.
- Bug fixes should ideally include a regression test that fails before the fix.
- Coverage is an indicator, not a target that encourages tests without value.

## 16. Errors, Logging, and Observability

- Show actionable messages to users; do not display stack traces/internal errors.
- Normalize API errors and preserve the original cause for observability when safe.
- Use toasts for brief/global action results and inline errors for contextual problems.
- Do not use `console.log` in production code. Use `console.warn/error` only at boundaries where they are genuinely necessary.
- When adding monitoring such as Sentry, configure sampling, source maps, environments, and PII redaction.
- Error boundaries do not replace mutation/form error handling.

## 17. Security Checklist

- No secrets in source code, client environment variables, fixtures, test output, or Git history.
- Validate all external inputs and responses at important boundaries.
- Do not use `dangerouslySetInnerHTML`; if it is unavoidable, sanitize with a proven library and explain why.
- External links that open a new tab must use `rel="noreferrer noopener"`.
- Frontend route guards are only for UX and must not be treated as authorization boundaries.
- Keep access JWTs strictly in runtime memory. Persist only the rotating refresh JWT in `localStorage`, using the centralized token-storage module required by the backend's explicit JSON-token contract.
- Transmit access JWTs only through `Authorization: Bearer <token>` and refresh JWTs only in the validated JSON body of the refresh endpoint. Never place either token in URLs, logs, analytics, query caches, error messages, or state snapshots.
- Because a JavaScript-readable refresh token is exposed if same-origin script execution is compromised, maintain a strict Content Security Policy, avoid unsafe inline/evaluated scripts, minimize third-party scripts, sanitize untrusted content, and keep dependencies reviewed. These controls reduce but do not eliminate XSS risk.
- Do not use cookies, `withCredentials`, or frontend CSRF tokens for the authentication flow unless the backend contract changes.
- Do not use locally decoded JWT claims to grant access. Use API responses as the authority for authenticated and authorized operations.
- On logout or failed session restoration, remove the persisted refresh JWT, clear the runtime access JWT and sensitive client caches, and broadcast the signed-out state to other tabs.
- Audit dependencies and review changelogs before major upgrades.
- Do not disable TLS verification or lint/type checks merely to make a build pass.

## 18. Performance Checklist

- Measure before optimizing.
- Use code splitting for large routes/features.
- Images must have explicit dimensions, efficient formats, and lazy loading when below the fold.
- Avoid global barrel exports that cause circular dependencies or increase bundle size.
- Do not ship a large library for a small need without comparing alternatives.
- Use pagination/virtualization for large collections.
- Avoid request waterfalls; prefetch or parallelize independent requests when beneficial.
- Monitor bundle size when making significant dependency changes.

## 19. Git, Commits, and Pull Requests

- Use one logical change per commit when possible.
- Use Conventional Commits: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`.
- Do not commit generated builds (`dist`), coverage, `.env.local`, logs, or caches.
- Do not change the lockfile unless dependencies actually change.
- PRs must explain the problem, solution, verification method, UI impact, and include screenshots when relevant.
- Avoid unrelated refactoring within a small feature/fix.

## 20. Definition of Done

A change is complete when the following relevant conditions are met:

- acceptance criteria are met;
- structure and naming follow this document;
- loading, empty, error, disabled, and success states are handled;
- responsiveness and keyboard accessibility are checked;
- no secrets or debug logs remain;
- new and affected tests pass;
- linting, type-checking, and format checks pass;
- the production build succeeds for changes that affect the build;
- documentation and `.env.example` are updated when contracts/configuration change.

## 21. Special Instructions for AI Agents

When working in this repository:

1. Read `AGENTS.md`, related files, and the actual configuration before changing code.
2. Do not assume the entire target structure already exists; inspect the filesystem first.
3. Make the smallest change that fully resolves the request.
4. Preserve established patterns unless the task specifically corrects those patterns.
5. Do not add dependencies without a clear need. Explain the purpose and trade-offs of new dependencies.
6. Do not replace the stack, package manager, or architecture without explicit approval.
7. Do not manually edit generated files, `node_modules`, or the lockfile.
8. Do not read or display secret values. Use `.env.example` for documentation.
9. Do not run destructive commands or deployments without explicit approval.
10. Do not leave a development server running permanently unless requested; stop it after validation.
11. For bugs, find the root cause and add a regression test when proportionate.
12. For UI work, use existing reusable components and check accessibility/responsiveness.
13. Run the minimum relevant validation first; expand only when the impact is broad.
14. Do not claim that tests/builds pass unless they were actually run.
15. Report concisely: changed files, important decisions, validation performed, and remaining risks.

### Validation Order by Change Type

- Documentation only: inspect content/diff and Markdown formatting.
- A single utility/schema: relevant tests + type-check.
- Components/features: relevant tests + lint + type-check.
- Configuration/dependencies/routing: lint + type-check + tests + production build.
- Critical user flows: add/run the relevant E2E tests.

## 22. Dependency and Import Boundaries

Allowed dependency direction:

```text
app/routes -> features -> components/common -> components/ui
     |            |               |                 |
     +----------> lib/config/hooks/types <-----------+
```

Additional rules:

- `components/ui` must not import `features`, `routes`, or `app`.
- `lib` and `config` must not import React components.
- A feature must not directly import another feature's internals.
- Routes may compose multiple features, but cross-feature business logic must be explicit.
- Avoid circular imports. Do not resolve them by moving everything into a `shared` folder.
- Use public `index.ts` barrels only at feature boundaries; avoid barrels in every small folder.

## 23. Documentation Required During Implementation

Once the starter kit has been built, maintain the following documents:

- `README.md` — quick start, requirements, commands, environment, and stack overview.
- `docs/architecture.md` — dependency direction and architectural decisions.
- `docs/folder-structure.md` — each folder's responsibilities, with examples.
- `docs/environment.md` — environment variables, ports, modes, and deployment configuration.
- `docs/development.md` — workflows for adding routes, features, forms, queries, and components.
- `docs/testing.md` — testing strategy and how to run every test type.
- `docs/deployment.md` — build artifacts, SPA fallback, per-platform environment configuration, and release checklist.
- `docs/ui-guidelines.md` — tokens, variants, accessibility, and reusable component patterns.

Documentation must be updated together with behavioral changes. Documentation examples must be copyable, consistent with the actual source, and free of secrets.

## 24. Default Decisions and Changes Requiring Approval

### Defaults

- Vite-based SPA.
- npm as the package manager.
- Development port `5173`, preview port `4173`.
- `@/` source alias.
- TanStack Router + Query.
- React Hook Form + Zod.
- Tailwind + shadcn/ui.
- Vitest + React Testing Library + Playwright.

### Obtain Approval Before

- switching to Next.js/Remix or another SSR framework;
- replacing npm, the router, the query library, or the form library;
- adding a global state manager;
- adding analytics/monitoring that transmits user data;
- changing the backend-aligned JSON access/refresh JWT contract, the in-memory access-token policy, or the centralized `localStorage` refresh-token policy;
- performing a major dependency upgrade;
- removing a public API, feature, test suite, or primary documentation;
- deploying or taking destructive action.

---

This document defines the target architecture and working rules. The actual implementation remains the source of truth for version and API details; if the two differ, resolve the inconsistency explicitly—do not leave it unaddressed.
