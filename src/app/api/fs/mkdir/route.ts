import { NextResponse } from "next/server";
import {
  mkdirpPath,
  normalizeSlashes,
  NO_STORE_HEADERS,
} from "@/server/fsService";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const rel = normalizeSlashes((body?.path || "").toString());
    if (!rel)
      return NextResponse.json(
        { error: "Missing path" },
        { status: 400, headers: NO_STORE_HEADERS }
      );

    await mkdirpPath(rel);
    return NextResponse.json({ ok: true }, { headers: NO_STORE_HEADERS });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Failed to create folder" },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  }
}
