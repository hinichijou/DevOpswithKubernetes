FROM node:26-alpine AS base

FROM base AS builder
WORKDIR /app

COPY package*json index.js ./

RUN npm ci

FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 hono

COPY --from=builder --chown=hono:nodejs /app/node_modules /app/node_modules
COPY --from=builder --chown=hono:nodejs /app/package.json /app/package.json
COPY --from=builder --chown=hono:nodejs /app/index.js /app/index.js

USER hono
EXPOSE 3000

CMD ["node", "index.js"]