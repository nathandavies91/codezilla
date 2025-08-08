import { NextResponse } from "next/server";
import { mkdir as mkdirLocal } from "node:fs/promises";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { ensureDockerContainer } from "../../../../server/dockerContainerManager";

function joinPath(a: string, b: string) {
  if (!a) return b;
  if (!b) return a;
  if (a.endsWith("/")) return a + (b.startsWith("/") ? b.slice(1) : b);
  return a + "/" + b;
}

async function dockerMkdir(container: string, dirPath: string) {
  const code =
    "const fs=require('fs'),p=process.argv[1];fs.mkdirSync(p,{recursive:true});";
  const child = spawn(
    "docker",
    ["exec", "-i", container, "node", "-e", code, dirPath],
    {
      stdio: ["ignore", "ignore", "pipe"],
    }
  );
  const stderr: Buffer[] = [];
  child.stderr.on("data", (d) => stderr.push(Buffer.from(d)));
  await new Promise<void>((resolve, reject) => {
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else
        reject(
          new Error(
            Buffer.concat(stderr).toString() || `docker exited with ${code}`
          )
        );
    });
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const rel = (body?.path || "").toString().replace(/\\+/g, "/");
    if (!rel)
      return NextResponse.json({ error: "Missing path" }, { status: 400 });

    const ctx = await ensureDockerContainer();

    if (ctx?.containerName) {
      const dirPath = rel.startsWith("/")
        ? rel
        : joinPath(ctx.projectPath, rel);
      await dockerMkdir(ctx.containerName, dirPath);
      return NextResponse.json({ ok: true });
    }

    const abs = join(process.cwd(), rel);
    await mkdirLocal(abs, { recursive: true });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Failed to create folder" },
      { status: 400 }
    );
  }
}
