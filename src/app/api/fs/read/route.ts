import { NextResponse } from "next/server";
import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";

// Read a file relative to project root
// GET /api/fs/read?path=src/app/page.tsx
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rel = (searchParams.get("path") || "").replace(/\\+/g, "/");
    if (!rel)
      return NextResponse.json({ error: "Missing path" }, { status: 400 });

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
