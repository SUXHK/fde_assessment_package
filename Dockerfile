# Multi-stage Docker build for Next.js 16 + Prisma + SQLite
ARG NODE_IMAGE=node:22-alpine

# ---- Stage 1: Install dependencies ----
FROM ${NODE_IMAGE} AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma/schema.prisma ./prisma/schema.prisma
ENV DATABASE_URL="file:./dev.db"
RUN npm ci

# ---- Stage 2: Build application ----
FROM ${NODE_IMAGE} AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build Next.js (standalone mode)
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---- Stage 3: Production runner ----
FROM ${NODE_IMAGE} AS runner
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone output
COPY --from=builder /app/.next/standalone ./

# Copy static assets
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Copy dependencies and Prisma schema for runtime db push
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

# Copy entrypoint
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

# Create data directory for SQLite
RUN mkdir -p /app/prisma/data && chown -R nextjs:nodejs /app/prisma

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV DATABASE_URL="file:/app/prisma/data/dev.db"

ENTRYPOINT ["/app/entrypoint.sh"]
