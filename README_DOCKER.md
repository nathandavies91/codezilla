# Run a brand-new Next.js app in Docker (no host files)

This setup builds a fresh Next.js application entirely inside Docker. Your current workspace files are not used inside the container.

## Development

1. Build and start:

   ```powershell
   docker compose up --build
   ```

2. Open http://localhost:3000 to see the new app scaffolding.

Customizing scaffolding:

- Change the app name via build arg: `APP_NAME=my-next-app`
- Change template flags via build arg: `NEXT_FLAGS` (defaults to `--ts --eslint --tailwind --app --src-dir --import-alias @/* --use-npm`)

Example:

```powershell
docker compose build --build-arg APP_NAME=hello-next --build-arg NEXT_FLAGS="--ts --eslint --app --src-dir --use-npm"
docker compose up
```

## Previewing the container app from the UI

Set the URL the UI should load in the preview iframe:

```powershell
$env:NEXT_PUBLIC_CONTAINER_URL="http://localhost:3001"
npm run dev
```

Or add to an `.env.local` file:

```
NEXT_PUBLIC_CONTAINER_URL=http://localhost:3001
```

## Production image

Build optimized image using the `prod` stage:

```powershell
docker build --target prod --build-arg APP_NAME=my-next-app -t my-next-app:prod .
```

Run it:

```powershell
docker run --rm -p 3000:3000 --name my-next-app my-next-app:prod
```
