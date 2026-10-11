# React Starter Kit

A production-oriented, beginner-maintainable React SPA foundation with strict TypeScript, accessible UI primitives, type-safe routing, server-state management, validated forms, and rotating JWT authentication.

## Requirements

- Node.js 22 or newer
- npm 10 or newer
- A compatible API at the configured `VITE_API_BASE_URL`

## Quick start

1. Activate the Node version in `.nvmrc`.
2. Copy `.env.example` to `.env.local`.
3. Run `npm install`.
4. Run `npm run dev`.
5. Open `http://localhost:5173`.

The backend login response must include `access_token` and `refresh_token`. Protected requests use the access Bearer token; refresh sends the refresh JWT in the JSON body.

## Stack

- React, TypeScript, Vite, and Tailwind CSS
- shadcn-compatible primitives, Radix, and Lucide
- TanStack Router, Query, and Table
- React Hook Form and Zod
- Axios and Sonner
- Vitest, Testing Library, MSW, and Playwright
- ESLint, Prettier, Husky, and lint-staged

## Commands

| Command                 | Purpose                                       |
| ----------------------- | --------------------------------------------- |
| `npm run dev`           | Start development on port 5173                |
| `npm run build`         | Type-check and create `dist`                  |
| `npm run preview`       | Preview `dist` on port 4173                   |
| `npm run lint`          | Run ESLint                                    |
| `npm run lint:fix`      | Apply safe lint fixes                         |
| `npm run format`        | Format supported files                        |
| `npm run format:check`  | Verify formatting                             |
| `npm run typecheck`     | Run TypeScript without emitting               |
| `npm test`              | Run unit/component tests once                 |
| `npm run test:coverage` | Generate coverage                             |
| `npm run test:e2e`      | Run Playwright                                |
| `npm run check`         | Run lint, types, tests, and formatting checks |

## Authentication security

Access JWTs stay in runtime memory. Only the rotating refresh JWT is persisted, through one centralized token-storage module. Startup restores the session before rendering routes; eligible `401` failures use coordinated refresh and retry once. Logout clears credentials and protected query caches even if its network request fails.

Because `localStorage` is readable by same-origin JavaScript, deployment requires strong XSS controls: a restrictive Content Security Policy, no unsafe HTML, minimal third-party scripts, and reviewed dependencies. Frontend route guards are UX only; the backend remains the authorization authority.

## Documentation

- [Architecture](docs/architecture.md)
- [Folder structure](docs/folder-structure.md)
- [Environment](docs/environment.md)
- [Development workflows](docs/development.md)
- [Testing](docs/testing.md)
- [Deployment](docs/deployment.md)
- [UI guidelines](docs/ui-guidelines.md)

Repository rules and architectural decisions are defined in [`AGENTS.md`](AGENTS.md).
