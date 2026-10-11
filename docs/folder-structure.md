# Folder structure

- `src/app`: browser entry composition, providers, and router configuration.
- `src/components/ui`: generic application-owned UI primitives.
- `src/components/common`: reusable cross-feature composition when genuine reuse exists.
- `src/components/layout`: application shells and page layout.
- `src/config`: validated environment and application configuration.
- `src/features/<feature>`: domain API, components, hooks, schemas, types, and public API.
- `src/lib`: technical integrations such as Axios and TanStack Query clients.
- `src/routes`: thin route/page composition.
- `src/styles`: global CSS and design tokens.
- `src/test`: global test setup, mocks, and render utilities.
- `e2e`: Playwright critical-flow specifications.
- `docs`: extended project documentation.

Colocate tests as `*.test.ts` or `*.test.tsx`. Expose a feature through its root `index.ts`; do not import another feature's internals. Use the `@/` alias for `src` imports.
