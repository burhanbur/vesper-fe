# Environment

Copy `.env.example` to `.env.local` for local development. Client environment variables are public and must never contain secrets.

| Variable            | Allowed/default                                | Purpose                                    |
| ------------------- | ---------------------------------------------- | ------------------------------------------ |
| `VITE_APP_NAME`     | `React Starter Kit`                            | Display name                               |
| `VITE_API_BASE_URL` | `http://localhost:3000/api/v1`                 | Backend API root                           |
| `VITE_APP_ENV`      | `development`, `test`, `staging`, `production` | Runtime label                              |
| `VITE_ENABLE_MOCKS` | `true`, `false`                                | Enables development mocks when implemented |

`VITE_ENABLE_CREDIT_CARD_CREATION` accepts `true` or `false` and defaults to `false`. Enable only after the additive backend migration and cross-client compatibility checks have been verified. It gates new card creation only; existing cards, history, purchases, repayments and limit edits remain available. This public UX switch is not an authorization boundary.

All values are validated once in `src/config/env.ts`. Components and features must import `env`; they must not access `import.meta.env` directly.

Development uses port `5173`; production preview uses `4173`. Both are strict ports. Override temporarily with `npm run dev -- --port 3000` or `npm run preview -- --port 8080`.
