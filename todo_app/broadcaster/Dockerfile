FROM node:26-alpine AS base

FROM base AS builder

#RUN apk add --no-cache gcompat
WORKDIR /app

COPY package*json index.js ./

RUN npm ci

FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 appgroup
RUN adduser --system --uid 1001 appuser

COPY --from=builder --chown=appuser:appgroup /app/node_modules /app/node_modules
COPY --from=builder --chown=appuser:appgroup /app/index.js /app/index.js

USER appuser

CMD ["node", "/app/index.js"]