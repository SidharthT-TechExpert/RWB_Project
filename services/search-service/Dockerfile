FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

FROM base AS deps
COPY package.json ./
COPY packages/shared/package.json ./packages/shared/
COPY services/search-service/package.json ./services/search-service/
RUN npm install --workspaces --if-present --ignore-scripts

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY packages/shared ./packages/shared
COPY services/search-service ./services/search-service
RUN cd services/search-service && npm run build

FROM base AS runner
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nodeuser
WORKDIR /app/services/search-service
COPY --from=builder --chown=nodeuser:nodejs /app/services/search-service/dist ./dist
COPY --from=deps --chown=nodeuser:nodejs /app/node_modules ../../node_modules
USER nodeuser
EXPOSE 3009
CMD ["node", "dist/server.js"]
