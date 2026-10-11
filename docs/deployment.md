# Deployment

Run `npm ci`, `npm run check`, and `npm run build`. Deploy the generated `dist` directory as static assets and configure the host to serve `index.html` as the fallback for application routes.

Environment values are embedded during build. Provide the correct public API URL for each environment and never place secrets in `VITE_*` variables.

Production hosting should provide HTTPS and a strict Content Security Policy. At minimum, restrict script, style, connection, image, font, frame, object, and base origins to what the application actually uses. Avoid `unsafe-inline` and `unsafe-eval`; test the final policy against the deployed bundle. Restrict third-party scripts because the persisted refresh JWT is JavaScript-readable.

Release checklist:

1. Quality gates and production build pass.
2. Environment values and API CORS origins are correct.
3. SPA fallback and immutable caching for hashed assets are configured.
4. TLS, security headers, and CSP are active.
5. Source-map and monitoring policies do not expose credentials or PII.
6. Login, restoration, refresh rotation, authorization failure, and logout are verified.
