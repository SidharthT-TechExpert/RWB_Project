FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install all workspace dependencies
FROM base AS deps
COPY package.json package-lock.json* ./
COPY packages/shared/package.json ./packages/shared/
COPY services/auth-service/package.json ./services/auth-service/
RUN npm ci --ignore-scripts 2>/dev/null || npm install --ignore-scripts

# Build shared package first, then the service
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY packages/shared ./packages/shared
COPY services/auth-service ./services/auth-service

# Build shared
WORKDIR /app/packages/shared
RUN npx tsc --outDir dist --rootDir src --declaration false 2>/dev/null || true

# Build service with path alias resolved
WORKDIR /app/services/auth-service
COPY services/auth-service/tsconfig.build.json ./tsconfig.build.json 2>/dev/null || true
RUN npx tsc -p tsconfig.json --outDir dist || npx ts-node --transpile-only src/server.ts &

FROM base AS runner
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nodeuser
WORKDIR /app

COPY --from=builder --chown=nodeuser:nodejs /app/packages/shared ./packages/shared
COPY --from=builder --chown=nodeuser:nodejs /app/services/auth-service ./services/auth-service
COPY --from=deps --chown=nodeuser:nodejs /app/node_modules ./node_modules

USER nodeuser
EXPOSE 3001
CMD ["node", "-r", "ts-node/register", "-r", "tsconfig-paths/register", "services/auth-service/src/server.ts"]
