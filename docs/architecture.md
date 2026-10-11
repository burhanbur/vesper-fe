# Architecture

## Dependency flow

```text
app/routes -> features -> components/common -> components/ui
     |            |               |                 |
     +----------> lib/config/hooks/types <-----------+
```

Routes compose screens and enforce navigation concerns. Features own domain behavior. `lib` contains technical integrations, while `config` validates application configuration. Generic UI primitives never import business features.

## Request flow

```text
route -> feature hook -> TanStack Query -> feature API -> apiClient -> backend
```

TanStack Query owns server state. Local component state remains local. URL state is used for shareable navigation and filters.

## Authentication

The API returns access and refresh JWTs as JSON. The access JWT is held only in module memory. The rotating refresh JWT is persisted under one application-scoped `localStorage` key by `auth-token-store.ts`.

At startup, `AuthBootstrap` attempts one refresh before rendering the router. Eligible `401` responses share one refresh request in the current tab and retry once. Web Locks serialize refresh rotation across tabs when supported, while BroadcastChannel propagates rotated credentials and logout events. A failed restore or refresh clears credentials and the query cache.

Route guards improve UX only. Backend authorization remains authoritative.

## Error boundaries

API failures are normalized to `ApiError`. Routes provide an error component and a not-found component. Features should show contextual errors inline and reserve toasts for brief global outcomes.
