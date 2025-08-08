import { NextResponse } from "next/server";
import { readdir } from "node:fs/promises";
import { join } from "node:path";

// List directory contents relative to project root
// GET /api/fs/list?dir=src/app
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const dir = (searchParams.get("dir") || "").replace(/\\+/g, "/");

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
