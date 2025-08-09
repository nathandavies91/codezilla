import { NextResponse } from "next/server";
import {
  readFileContent,
  normalizeSlashes,
  NO_STORE_HEADERS,
} from "@/server/fsService";

// Read a file relative to project root or inside a container
// GET /api/fs/read?path=src/app/page.tsx
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rel = normalizeSlashes(searchParams.get("path") || "");
    if (!rel)
      return NextResponse.json(
        { error: "Missing path" },
        { status: 400, headers: NO_STORE_HEADERS }
      );

    const content = await readFileContent(rel);
    return NextResponse.json({ content }, { headers: NO_STORE_HEADERS });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Failed to read file" },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  }
}
