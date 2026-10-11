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

Before opening a pull request, run `npm run check` and `npm run build`. Run relevant Playwright flows for critical behavior.
