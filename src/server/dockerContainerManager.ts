import { spawn } from "node:child_process";
import { once } from "node:events";
import { randomBytes } from "node:crypto";
import path from "node:path";

type ContainerCtx = {
  containerName: string;
  projectPath: string;
};

declare global {
  // eslint-disable-next-line no-var
  var __CODEZILLA_FS_CONTAINER__:
    | {
        ctx?: ContainerCtx;
        starting?: Promise<ContainerCtx | null>;
        cleanupInstalled?: boolean;
        cleaned?: boolean;
        owned?: boolean; // whether this process created the container
      }
    | undefined;
}

const g = globalThis as any as typeof globalThis & {
  __CODEZILLA_FS_CONTAINER__?: {
    ctx?: ContainerCtx;
    starting?: Promise<ContainerCtx | null>;
    cleanupInstalled?: boolean;
    cleaned?: boolean;
    owned?: boolean;
  };
};

function runDocker(
  args: string[]
): Promise<{ stdout: string; stderr: string; code: number | null }> {
  return new Promise((resolve) => {
    const child = spawn("docker", args, { stdio: ["ignore", "pipe", "pipe"] });
    const out: Buffer[] = [];
    const err: Buffer[] = [];
    child.stdout.on("data", (d) => out.push(Buffer.from(d)));
    child.stderr.on("data", (d) => err.push(Buffer.from(d)));
    child.on("close", (code) => {
      resolve({
        stdout: Buffer.concat(out).toString("utf8"),
        stderr: Buffer.concat(err).toString("utf8"),
        code,
      });
    });
  });
}

async function removeContainer(name: string) {
  await runDocker(["rm", "-f", name]);
}

function installCleanupOnce(name: string) {
  if (!g.__CODEZILLA_FS_CONTAINER__) g.__CODEZILLA_FS_CONTAINER__ = {};
  const state = g.__CODEZILLA_FS_CONTAINER__;
  if (state?.cleanupInstalled) return;
  state!.cleanupInstalled = true;

  const doCleanup = async () => {
    if (!g.__CODEZILLA_FS_CONTAINER__ || g.__CODEZILLA_FS_CONTAINER__!.cleaned)
      return;
    g.__CODEZILLA_FS_CONTAINER__!.cleaned = true;
    try {
      // Only remove if we own it (i.e., we created it)
      if (g.__CODEZILLA_FS_CONTAINER__!.owned) {
        await removeContainer(name);
      }
    } catch {
      // ignore
    }
  };

  process.on("exit", () => void doCleanup());
  process.on("SIGINT", async () => {
    await doCleanup();
    process.exit(130);
  });
  process.on("SIGTERM", async () => {
    await doCleanup();
    process.exit(143);
  });
}

async function resolveExistingTarget(): Promise<ContainerCtx | null> {
  const targetName = process.env.TARGET_CONTAINER_NAME || "my-next-app";
  const projectPath = (
    process.env.TARGET_CONTAINER_PROJECT_PATH || "/app"
  ).replace(/\\+/g, "/");
  const ping = await runDocker(["ps", "--format", "{{.Names}}"]);
  if (ping.code !== 0) return null;
  const names = ping.stdout.split(/\r?\n/).filter(Boolean);
  if (!names.includes(targetName)) return null;

  // Found running target container
  process.env.CONTAINER_NAME = targetName;
  process.env.CONTAINER_PROJECT_PATH = projectPath;
  return { containerName: targetName, projectPath };
}

async function startManagedContainer(): Promise<ContainerCtx | null> {
  // Check docker availability quickly
  const ping = await runDocker(["version", "--format", "{{.Server.Version}}"]);
  if (ping.code !== 0) return null;

  const image = process.env.CONTAINER_IMAGE || "node:20-alpine";
  const projectPath = (process.env.CONTAINER_PROJECT_PATH || "/app").replace(
    /\\+/g,
    "/"
  );

  // Ensure image present (optional but helpful)
  await runDocker(["pull", image]);

  // Make a unique container name per process
  const id = randomBytes(3).toString("hex");
  const containerName = `codezilla-fs-${process.pid}-${id}`;

  // Host path to mount
  const hostPath = path.resolve(process.cwd());

  // In case a container with same name exists (unlikely), remove it
  await removeContainer(containerName).catch(() => {});

  // Run detached container, keep it alive
  const args = [
    "run",
    "-d",
    "--rm",
    "--name",
    containerName,
    "-v",
    `${hostPath}:${projectPath}`,
    "-w",
    projectPath,
    image,
    "sh",
    "-c",
    "tail -f /dev/null",
  ];
  const res = await runDocker(args);
  if (res.code !== 0) {
    // Cannot start container; fall back to local
    return null;
  }

  // Mark as owned so we clean it up on exit
  g.__CODEZILLA_FS_CONTAINER__!.owned = true;
  installCleanupOnce(containerName);

  // Expose for convenience
  process.env.CONTAINER_NAME = containerName;
  process.env.CONTAINER_PROJECT_PATH = projectPath;

  return { containerName, projectPath };
}

export async function ensureDockerContainer(): Promise<ContainerCtx | null> {
  if (!g.__CODEZILLA_FS_CONTAINER__) g.__CODEZILLA_FS_CONTAINER__ = {};
  const state = g.__CODEZILLA_FS_CONTAINER__!;
  if (state.ctx) return state.ctx;
  if (state.starting) return state.starting;

  state.starting = (async () => {
    // Prefer attaching to an existing target container (e.g., docker-compose app)
    const target = await resolveExistingTarget();
    if (target) {
      state.owned = false;
      state.ctx = target;
      return target;
    }

    // Optionally start a managed helper container if allowed
    if (process.env.DISABLE_AUTO_DOCKER !== "1") {
      const managed = await startManagedContainer();
      state.ctx = managed ?? undefined;
      return managed;
    }

    return null;
  })();

  return state.starting;
}
