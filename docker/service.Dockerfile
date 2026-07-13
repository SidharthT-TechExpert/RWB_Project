# Shared Dockerfile for all QuickBite microservices
# Build arg: SERVICE = name of the service folder (e.g. auth-service)

ARG NODE_VERSION=20

# ─── Stage 1: Install dependencies ───────────────────────────
FROM node:${NODE_VERSION}-alpine AS deps
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

COPY package.json package-lock.json* ./
COPY packages/shared/package.json ./packages/shared/
ARG SERVICE
COPY services/${SERVICE}/package.json ./services/${SERVICE}/
RUN npm ci --ignore-scripts

# ─── Stage 2: Runtime ────────────────────────────────────────
FROM node:${NODE_VERSION}-alpine AS runner
RUN apk add --no-cache libc6-compat wget
WORKDIR /app

ARG SERVICE
ENV SERVICE_DIR=services/${SERVICE}
ENV NODE_ENV=production
ENV TS_NODE_TRANSPILE_ONLY=true
ENV TS_NODE_FILES=true

COPY --from=deps /app/node_modules ./node_modules
COPY packages/shared ./packages/shared
ARG SERVICE
COPY services/${SERVICE} ./services/${SERVICE}

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nodeuser \
 && chown -R nodeuser:nodejs /app

COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

USER nodeuser
ENTRYPOINT ["/entrypoint.sh"]
