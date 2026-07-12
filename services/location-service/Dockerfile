FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

FROM base AS deps
COPY package.json ./
COPY packages/shared/package.json ./packages/shared/
COPY services/location-service/package.json ./services/location-service/
RUN npm install --workspaces --if-present --ignore-scripts

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY packages/shared ./packages/shared
COPY services/location-service ./services/location-service
RUN cd services/location-service && npm run build

FROM base AS runner
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nodeuser
WORKDIR /app/services/location-service
COPY --from=builder --chown=nodeuser:nodejs /app/services/location-service/dist ./dist
COPY --from=deps --chown=nodeuser:nodejs /app/node_modules ../../node_modules
USER nodeuser
EXPOSE 3010
CMD ["node", "dist/server.js"]
