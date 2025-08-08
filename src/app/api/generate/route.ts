import { NextResponse } from "next/server";

// GET /api/generate
export async function GET(_: Request) {
  return NextResponse.json({ message: "Hello from Codezilla API" });
}

// POST /api/hello
// export async function POST(req: Request) {
//   try {
//     const body = await req.json();
//     return NextResponse.json({ received: body }, { status: 200 });
//   } catch {
//     return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
//   }
// }

export async function POST() {
  // Simple starter HTML
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Generated Page</title>
  <style>
    body { font-family: sans-serif; background: #f5f5f5; padding: 2rem; }
    h1 { color: #4f46e5; }
  </style>
</head>
<body>
  <h1>Hello from Generated Code 🎉</h1>
  <p>This page was generated dynamically!</p>
</body>
</html>
  `;
  return NextResponse.json({ code: html });
}
