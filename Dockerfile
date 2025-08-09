# Build a brand-new Next.js app inside Docker (no host files used)

# ---------- Scaffold stage: creates a new Next.js app ----------
FROM node:20-alpine AS scaffold
WORKDIR /app
# Alpine: glibc compatibility for Next/SWC
RUN apk add --no-cache libc6-compat

# Configure flags for create-next-app (deterministic, non-interactive)
ENV NEXT_TELEMETRY_DISABLED=1 \
    CI=1

# Create a new Next.js project directly in /app/app to avoid moves and arg globbing
RUN npm config set fund false && npm config set update-notifier false \
    && npx --yes create-next-app@latest app \
    --ts \
    --eslint \
    --tailwind \
    --app \
    --src-dir \
    --import-alias "@/*" \
    --use-npm \
    --turbopack

# ---------- Dev stage: runs the app with next dev ----------
FROM node:20-alpine AS dev
WORKDIR /app
# Alpine: glibc compatibility for Next/SWC
RUN apk add --no-cache libc6-compat
ENV NEXT_TELEMETRY_DISABLED=1 \
    PORT=3001
# Copy from fixed path
COPY --from=scaffold /app/app/ ./
EXPOSE 3001
CMD ["npm", "run", "dev", "--", "-p", "3001", "-H", "0.0.0.0"]

# ---------- Prod stage: builds and runs optimized server ----------
FROM node:20-alpine AS prod
WORKDIR /app
# Alpine: glibc compatibility for Next/SWC
RUN apk add --no-cache libc6-compat
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3001
COPY --from=scaffold /app/app/ ./
RUN npm run build
EXPOSE 3001
CMD ["npm", "start", "--", "-p", "3001", "-H", "0.0.0.0"]
