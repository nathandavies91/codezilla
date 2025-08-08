import { NextResponse } from "next/server";
import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { spawn } from "node:child_process";

async function dockerCat(container: string, filePath: string): Promise<string> {
  const child = spawn(
    "docker",
    ["exec", "-i", container, "bash", "-lc", `cat "$1"`, "_", filePath],
    {
      stdio: ["ignore", "pipe", "pipe"],
    }
  );
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
  return Buffer.concat(stdout).toString("utf8");
}

function joinPath(a: string, b: string) {
  if (!a) return b;
  if (!b) return a;
  if (a.endsWith("/")) return a + (b.startsWith("/") ? b.slice(1) : b);
  return a + "/" + b;
}

// Read a file relative to project root or inside a container
// GET /api/fs/read?path=src/app/page.tsx
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rel = (searchParams.get("path") || "").replace(/\\+/g, "/");
    if (!rel)
      return NextResponse.json({ error: "Missing path" }, { status: 400 });

    const container = process.env.CONTAINER_NAME;
    const projectPath = (process.env.CONTAINER_PROJECT_PATH || "/app").replace(
      /\\+/g,
      "/"
    );

    if (container) {
      const filePath = rel.startsWith("/") ? rel : joinPath(projectPath, rel);
      const content = await dockerCat(container, filePath);
      return NextResponse.json({ content });
    }

    // Local fallback
    const root = process.cwd();
    const abs = join(root, rel);
    const s = await stat(abs);
    if (!s.isFile())
      return NextResponse.json({ error: "Not a file" }, { status: 400 });

    const buf = await readFile(abs);
    const content = buf.toString("utf8");

    return NextResponse.json({ content });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Failed to read file" },
      { status: 400 }
    );
  }
}
