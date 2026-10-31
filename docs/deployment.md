# Deployment

Run `npm ci`, `npm run check`, and `npm run build`. Deploy the generated `dist` directory as static assets and configure the host to serve `index.html` as the fallback for application routes.

Environment values are embedded during build. Provide the correct public API URL for each environment and never place secrets in `VITE_*` variables.

## Docker deployment

The root `Dockerfile` builds the application with Node.js 22 and serves only `dist` through non-root Nginx on container port `8080`. `docker-compose.yml` runs the web service with automatic restart, a healthcheck, dropped Linux capabilities, and bounded logs. `.dockerignore` excludes local environment files, dependencies, build output, and reports from the image context.

From the `vesper-web` directory, build and start:

```sh
VITE_API_BASE_URL=https://api.example.com/api/v1 VITE_APP_ENV=production docker compose up -d --build
```

Open `http://localhost:8080` for a local smoke test. For production, terminate HTTPS at a reverse proxy and forward traffic to `127.0.0.1:8080`. The service binds to loopback by default. If the reverse proxy is in another container, connect it through an explicitly configured Docker network, or publish on an appropriate interface using `WEB_BIND_ADDRESS`; restrict access with the host firewall.

Compose automatically reads a root `.env` file, if present. Shell values in the command above override that file. `.env.local` is not read by Compose. Always explicitly set production values instead of relying on local development defaults.

| Variable            | Default      | Purpose                                                       |
| ------------------- | ------------ | ------------------------------------------------------------- |
| `VITE_API_BASE_URL` | Required     | Public browser-accessible API URL, including `/api/v1`        |
| `VITE_APP_NAME`     | `Vesper`     | Public application name embedded at build time                |
| `VITE_APP_ENV`      | `production` | Public application mode embedded at build time                |
| `WEB_BIND_ADDRESS`  | `127.0.0.1`  | Host interface on which the web port is published             |
| `WEB_PORT`          | `8080`       | Host port mapped to container port `8080`                     |
| `WEB_IMAGE_TAG`     | `latest`     | Local image tag; use a release-specific value for deployments |

Compose forces `VITE_ENABLE_MOCKS=false`. Changing a `VITE_*` value requires rebuilding the image; runtime environment changes alone do not alter the compiled JavaScript. Never pass secrets as build arguments.

### Connecting to the backend

The browser calls the configured backend directly; this Nginx configuration does not proxy API requests. Do not use `http://backend:3000` or another Docker-only hostname for `VITE_API_BASE_URL`. Use the backend's public HTTPS URL and allow the exact frontend HTTPS origin in the backend CORS configuration. An HTTPS frontend cannot call an HTTP API because of browser mixed-content protection.

The existing `vesper-be/docker-compose.yml` currently runs Redis only, not the backend application. Deploy the backend application and its PostgreSQL/Redis dependencies separately, and run backend migrations as an explicit deployment step. This frontend Compose file does not start or migrate the backend.

### Health, caching, and operations

- `/health/live` returns `200` when Nginx is serving; it does not check backend availability.
- Application routes fall back to `index.html`, supporting direct links and refreshes.
- `index.html` is not cached; hashed `/assets/` files use long-lived immutable caching. Missing assets return `404` rather than SPA HTML.
- Inspect status with `docker compose ps` and logs with `docker compose logs --tail=100 web`.
- Stop without deleting data using `docker compose stop web`.
- Before rollout, test login, a deep link such as `/groups`, API access, and mobile layout.

Production hosting should provide HTTPS and a strict Content Security Policy. At minimum, restrict script, style, connection, image, font, frame, object, and base origins to what the application actually uses. Avoid `unsafe-inline` and `unsafe-eval`; test the final policy against the deployed bundle. Restrict third-party scripts because the persisted refresh JWT is JavaScript-readable.

Release checklist:

1. Quality gates and production build pass.
2. Environment values and API CORS origins are correct.
3. SPA fallback and immutable caching for hashed assets are configured.
4. TLS, security headers, and CSP are active.
5. Source-map and monitoring policies do not expose credentials or PII.
6. Login, restoration, refresh rotation, authorization failure, and logout are verified.
