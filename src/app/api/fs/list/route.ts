import { NextResponse } from "next/server";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { ensureDockerContainer } from "../../../../server/dockerContainerManager";

function joinPath(a: string, b: string) {
  if (!a) return b;
  if (!b) return a;
  if (a.endsWith("/")) return a + (b.startsWith("/") ? b.slice(1) : b);
  return a + "/" + b;
}

async function dockerList(
  container: string,
  dirPath: string
): Promise<{ name: string; path: string; type: "file" | "directory" }[]> {
  const code = `const fs=require('fs');const p=process.argv[1];const list=fs.readdirSync(p,{withFileTypes:true}).filter(d=>!d.name.startsWith('.') ).map(d=>({name:d.name,type:d.isDirectory()?'directory':'file'}));process.stdout.write(JSON.stringify(list));`;
  const args = ["exec", "-i", container, "node", "-e", code, dirPath];
  const child = spawn("docker", args, { stdio: ["ignore", "pipe", "pipe"] });
  const stdout: Buffer[] = [];
  const stderr: Buffer[] = [];
  await new Promise<void>((resolve, reject) => {
    child.stdout.on("data", (d) => stdout.push(Buffer.from(d)));
    child.stderr.on("data", (d) => stderr.push(Buffer.from(d)));
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
  const json = Buffer.concat(stdout).toString("utf8");
  const entries = JSON.parse(json) as {
    name: string;
    type: "file" | "directory";
  }[];
  return entries.map((e) => ({
    name: e.name,
    type: e.type,
    path: joinPath(dirPath, e.name),
  }));
}

// List directory contents relative to project root or container project path
// GET /api/fs/list?dir=src/app
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const raw = (searchParams.get("dir") || "").replace(/\\+/g, "/");

    // Start container on first import/request and reuse it
    const ctx = await ensureDockerContainer();

    console.log("ctx", ctx);

    if (ctx?.containerName) {
      const container = ctx.containerName;
      const projectPath = ctx.projectPath;

      const dirPath = raw
        ? raw.startsWith("/")
          ? raw
          : joinPath(projectPath, raw)
        : projectPath;
      const entries = await dockerList(container, dirPath);
      return NextResponse.json({ entries });
    }

    // Local filesystem fallback
    const dir = raw;
    const root = process.cwd();
    const abs = join(root, dir);
    const names = await readdir(abs, { withFileTypes: true });
    const entries = names
      .filter((d) => !d.name.startsWith("."))
      .map((d) => ({
        name: d.name,
        path: [dir, d.name].filter(Boolean).join("/"),
        type: d.isDirectory() ? "directory" : "file",
      }));

    return NextResponse.json({ entries });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Failed to read dir" },
      { status: 400 }
    );
  }
}
