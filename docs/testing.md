# Testing

## Commands

- `npm test`: run Vitest once.
- `npm run test:watch`: run Vitest in watch mode.
- `npm run test:coverage`: generate text and HTML coverage.
- `npm run test:e2e`: run Playwright critical flows.

## Strategy

Use unit tests for schemas and pure logic, component tests for visible interactions and state, and a small number of E2E tests for critical flows. Mock network boundaries with MSW rather than mocking internal feature hooks in integration tests.

Prefer role, label, and visible-text queries. Do not assert Tailwind classes or create large snapshots. Keep tests deterministic and independent of real services unless an explicitly configured integration suite requires them.

Authentication tests must preserve the central token policy: access credentials remain memory-only, refresh credentials use centralized storage, failed restoration clears sensitive state, and requests retry no more than once.
