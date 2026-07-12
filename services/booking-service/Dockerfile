FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

FROM base AS deps
COPY package.json ./
COPY packages/shared/package.json ./packages/shared/
COPY services/booking-service/package.json ./services/booking-service/
RUN npm install --workspaces --if-present --ignore-scripts

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY packages/shared ./packages/shared
COPY services/booking-service ./services/booking-service
RUN cd services/booking-service && npm run build

FROM base AS runner
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nodeuser
WORKDIR /app/services/booking-service
COPY --from=builder --chown=nodeuser:nodejs /app/services/booking-service/dist ./dist
COPY --from=deps --chown=nodeuser:nodejs /app/node_modules ../../node_modules
USER nodeuser
EXPOSE 3005
CMD ["node", "dist/server.js"]
