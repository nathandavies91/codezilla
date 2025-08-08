import { NextResponse } from "next/server";
import { mkdir, writeFile as writeLocalFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { spawn } from "node:child_process";
import { ensureDockerContainer } from "../../../../server/dockerContainerManager";

function joinPath(a: string, b: string) {
  if (!a) return b;
  if (!b) return a;
  if (a.endsWith("/")) return a + (b.startsWith("/") ? b.slice(1) : b);
  return a + "/" + b;
}

async function dockerWrite(
  container: string,
  filePath: string,
  content: string
) {
  const code =
    "const fs=require('fs'),p=process.argv[1],path=require('path');fs.mkdirSync(path.dirname(p),{recursive:true});const chunks=[];process.stdin.on('data',c=>chunks.push(c)).on('end',()=>{fs.writeFileSync(p,Buffer.concat(chunks));}).resume();";
  const child = spawn(
    "docker",
    ["exec", "-i", container, "node", "-e", code, filePath],
    {
      stdio: ["pipe", "pipe", "pipe"],
    }
  );
  const stderr: Buffer[] = [];
  child.stderr.on("data", (d) => stderr.push(Buffer.from(d)));
  const done = new Promise<void>((resolve, reject) => {
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
  child.stdin!.write(content, "utf8");
  child.stdin!.end();
  await done;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const rel = (body?.path || "").toString().replace(/\\+/g, "/");
    const content = typeof body?.content === "string" ? body.content : "";
    if (!rel)
      return NextResponse.json({ error: "Missing path" }, { status: 400 });

    const ctx = await ensureDockerContainer();

    if (ctx?.containerName) {
      const filePath = rel.startsWith("/")
        ? rel
        : joinPath(ctx.projectPath, rel);
      await dockerWrite(ctx.containerName, filePath, content);
      return NextResponse.json({ ok: true });
    }

    // Local fallback
    const abs = join(process.cwd(), rel);
    await mkdir(dirname(abs), { recursive: true });
    await writeLocalFile(abs, content, "utf8");
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Failed to write file" },
      { status: 400 }
    );
  }
}
