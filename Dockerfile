FROM node:24-alpine AS builder
WORKDIR /app
ENV HUSKY=0
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

# Vite embeds these public values into the browser bundle at build time.
ARG VITE_APP_NAME=Vesper
ARG VITE_API_BASE_URL
ARG VITE_APP_ENV=production
ARG VITE_ENABLE_MOCKS=false
ENV VITE_APP_NAME=${VITE_APP_NAME} \
    VITE_API_BASE_URL=${VITE_API_BASE_URL} \
    VITE_APP_ENV=${VITE_APP_ENV} \
    VITE_ENABLE_MOCKS=${VITE_ENABLE_MOCKS}
RUN test -n "$VITE_API_BASE_URL" && npm run build

FROM nginxinc/nginx-unprivileged:1-alpine AS runner
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
USER 101
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1:8080/health/live || exit 1
