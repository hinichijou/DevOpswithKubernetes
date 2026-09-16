FROM node:26-alpine AS base

FROM base AS builder

#RUN apk add --no-cache gcompat
WORKDIR /app

COPY package*json tsconfig.json ./
COPY src ./src

RUN npm ci && \
    npm run build && \
    npm prune --production

FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 controllergroup
RUN adduser --system --uid 1001 controller

COPY --from=builder --chown=controller:controllergroup /app/node_modules /app/node_modules
COPY --from=builder --chown=controller:controllergroup /app/dist /app/dist
COPY --from=builder --chown=controller:controllergroup /app/package.json /app/package.json

USER controller

CMD ["node", "/app/dist/index.js"]