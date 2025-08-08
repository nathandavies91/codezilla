import { NextResponse } from "next/server";
import {
  writeFileContent,
  normalizeSlashes,
  NO_STORE_HEADERS,
} from "@/server/fsService";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const rel = normalizeSlashes((body?.path || "").toString());
    const content = typeof body?.content === "string" ? body.content : "";
    if (!rel)
      return NextResponse.json(
        { error: "Missing path" },
        { status: 400, headers: NO_STORE_HEADERS }
      );

    await writeFileContent(rel, content);
    return NextResponse.json({ ok: true }, { headers: NO_STORE_HEADERS });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Failed to write file" },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  }
}
