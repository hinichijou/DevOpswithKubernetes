FROM node:26-alpine AS base

FROM base AS builder

#RUN apk add --no-cache gcompat
WORKDIR /app

COPY . ./

RUN npm ci && \
    npm run build && \
    npm prune --production

FROM nginxinc/nginx-unprivileged:alpine3.24-slim AS runner
WORKDIR /app

COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=builder /app/images /usr/share/nginx/html/images/
COPY --from=builder /app/nginx.conf /etc/nginx/conf.d/default.conf