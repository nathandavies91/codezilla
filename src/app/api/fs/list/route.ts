import { NextResponse } from "next/server";
import {
  listDir,
  NO_STORE_HEADERS,
  normalizeSlashes,
} from "@/server/fsService";

// List directory contents relative to project root or container project path
// GET /api/fs/list?dir=src/app
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const raw = normalizeSlashes(searchParams.get("dir") || "");

    const entries = await listDir(raw);
    return NextResponse.json({ entries }, { headers: NO_STORE_HEADERS });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Failed to read dir" },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  }
}
