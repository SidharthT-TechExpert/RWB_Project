# Shared Dockerfile for all QuickBite microservices
# Build arg: SERVICE = name of the service folder (e.g. auth-service)

ARG NODE_VERSION=20

# ─── Stage 1: Install ALL dependencies (including devDeps for build) ──
FROM node:${NODE_VERSION}-alpine AS deps
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

COPY package.json package-lock.json* ./
COPY packages/shared/package.json ./packages/shared/
ARG SERVICE
COPY services/${SERVICE}/package.json ./services/${SERVICE}/
RUN npm ci --ignore-scripts

# ─── Stage 2: Build TypeScript → JavaScript ───────────────────
FROM node:${NODE_VERSION}-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

ARG SERVICE

# Copy deps
COPY --from=deps /app/node_modules ./node_modules
COPY packages/shared ./packages/shared
COPY services/${SERVICE} ./services/${SERVICE}

# Build shared package first so path aliases resolve
WORKDIR /app/packages/shared
RUN npx tsc

# Build the service
WORKDIR /app/services/${SERVICE}
RUN npx tsc

# ─── Stage 3: Production runtime (no devDeps, only compiled JS) ──
FROM node:${NODE_VERSION}-alpine AS runner
RUN apk add --no-cache libc6-compat wget
WORKDIR /app

ARG SERVICE
ENV SERVICE_DIR=services/${SERVICE}
ENV NODE_ENV=production

# Install production deps only
COPY package.json package-lock.json* ./
COPY packages/shared/package.json ./packages/shared/
COPY services/${SERVICE}/package.json ./services/${SERVICE}/
RUN npm ci --ignore-scripts --omit=dev

# Copy compiled output
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY packages/shared/package.json ./packages/shared/
COPY --from=builder /app/services/${SERVICE}/dist ./services/${SERVICE}/dist

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nodeuser \
 && chown -R nodeuser:nodejs /app

COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

USER nodeuser
ENTRYPOINT ["/entrypoint.sh"]
