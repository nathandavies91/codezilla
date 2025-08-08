import { NextResponse } from "next/server";

// GET /api/hello
export async function GET(_: Request) {
  return NextResponse.json({ message: "Hello from Codezilla API" });
}

// POST /api/hello
export async function POST(req: Request) {
  try {
    const body = await req.json();
    return NextResponse.json({ received: body }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}
