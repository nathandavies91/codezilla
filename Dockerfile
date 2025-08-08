# Build a brand-new Next.js app inside Docker (no host files used)

# ---------- Scaffold stage: creates a new Next.js app ----------
FROM node:20-alpine AS scaffold
WORKDIR /app

# Configure app name and flags for create-next-app
ARG APP_NAME=my-next-app
ARG NEXT_FLAGS="--ts --eslint --tailwind --app --src-dir --import-alias @/* --use-npm"
ENV NEXT_TELEMETRY_DISABLED=1

# Create a new Next.js project non-interactively
RUN npm config set fund false && npm config set update-notifier false \
    && npx --yes create-next-app@latest ${APP_NAME} ${NEXT_FLAGS}

# ---------- Dev stage: runs the app with next dev ----------
FROM node:20-alpine AS dev
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1 \
    PORT=3001
ARG APP_NAME=my-next-app
COPY --from=scaffold /app/${APP_NAME}/ ./
EXPOSE 3001
CMD ["npm", "run", "dev", "--", "-p", "3001", "-H", "0.0.0.0"]

# ---------- Prod stage: builds and runs optimized server ----------
FROM node:20-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3001
ARG APP_NAME=my-next-app
COPY --from=scaffold /app/${APP_NAME}/ ./
RUN npm run build
EXPOSE 3001
CMD ["npm", "start", "--", "-p", "3001", "-H", "0.0.0.0"]
