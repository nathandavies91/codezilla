# ---------- Base deps layer ----------
FROM node:20-alpine AS base

# Ensure openssl for Prisma or other native deps if needed
RUN apk add --no-cache libc6-compat

WORKDIR /app

# ---------- Dependencies ----------
FROM base AS deps
# Install OS deps used by builds (git optional)
RUN apk add --no-cache python3 make g++

# Install dependencies with npm ci (lockfile recommended)
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN \
    if [ -f package-lock.json ]; then npm ci; \
    elif [ -f pnpm-lock.yaml ]; then npm -g i pnpm && pnpm i --frozen-lockfile; \
    elif [ -f yarn.lock ]; then npm -g i yarn && yarn --frozen-lockfile; \
    else npm i; fi

# ---------- Builder ----------
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set production env for build
ENV NODE_ENV=production

# Build Next.js app
RUN npm run build

# ---------- Runtime ----------
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Copy standalone server and public assets
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

# Expose port
EXPOSE 3000

ENV PORT=3000

# Start Next.js
CMD ["node", "server.js"]
