# ─── Stage 1: Install dependencies ───────────────────────────
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

COPY server/package.json server/package-lock.json* ./
RUN npm install --ignore-scripts --omit=optional

# ─── Stage 2: Build TypeScript ────────────────────────────────
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY server/ .
RUN npx tsc

# ─── Stage 3: Production runtime ──────────────────────────────
FROM node:20-alpine AS runner
RUN apk add --no-cache libc6-compat wget
WORKDIR /app

ENV NODE_ENV=production

# Production deps only
COPY server/package.json server/package-lock.json* ./
RUN npm ci --ignore-scripts --omit=dev

# Compiled output
COPY --from=builder /app/dist ./dist

# Non-root user
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nodeuser \
 && chown -R nodeuser:nodejs /app

RUN mkdir -p logs && chown nodeuser:nodejs logs

USER nodeuser

EXPOSE 3000
ENV PORT=3000

CMD ["node", "dist/server.js"]
