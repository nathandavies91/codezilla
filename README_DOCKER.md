# Run this Next.js app in Docker

Two options: development (hot-reload) with docker-compose, or production image with a multi-stage Dockerfile.

## Development (hot reload)

Requirements: Docker Desktop

1. Build and start

   ```powershell
   docker compose up --build
   ```

2. Visit http://localhost:3000

Notes:

- Source is bind-mounted, changes trigger hot reload.
- Node modules are container-local to avoid OS/ABI mismatches.

## Production image

1. Build:

   ```powershell
   docker build -t codezilla-next:prod .
   ```

2. Run:

   ```powershell
   docker run --rm -p 3000:3000 --name codezilla-next codezilla-next:prod
   ```

This uses `next.config.ts` output=standalone for small runtime image.
