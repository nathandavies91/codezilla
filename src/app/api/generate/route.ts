import { NextResponse } from "next/server";

// GET /api/generate
export async function GET(_: Request) {
  return NextResponse.json({ message: "Hello from Codezilla API" });
}

// POST /api/generate
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
    if (!prompt) {
      return NextResponse.json(
        { error: "Missing 'prompt' in request body" },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    // If an API key is available, try generating via OpenAI
    if (apiKey) {
      try {
        const completionRes = await fetch(
          "https://api.openai.com/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              temperature: 0.7,
              messages: [
                {
                  role: "system",
                  content:
                    "You are a code generator that outputs only a complete, self-contained HTML document with inline CSS and JavaScript when needed. Do not include markdown, backticks, or explanations.",
                },
                {
                  role: "user",
                  content: `Build this as a single HTML file:\n${prompt}`,
                },
              ],
            }),
          }
        );

        if (!completionRes.ok) {
          const err = await completionRes.text();
          console.error("OpenAI error:", err);
          // Fall through to local fallback below
        } else {
          const json = await completionRes.json();
          const content = json?.choices?.[0]?.message?.content?.trim?.();
          if (content) {
            return NextResponse.json({ code: content });
          }
        }
      } catch (err) {
        console.error("Error calling OpenAI:", err);
        // Fall through to fallback
      }
    }

    // Fallback simple HTML based on prompt
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset=\"utf-8\" />
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
  <title>Generated: ${prompt.replace(/</g, "&lt;")}</title>
  <style>
    :root{ --indigo:#4f46e5 }
    *{ box-sizing:border-box }
    body{ font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica, Arial, \"Apple Color Emoji\", \"Segoe UI Emoji\"; margin:0; padding:2rem; background:#f5f5f7; color:#111 }
    header{ display:flex; align-items:center; gap:.75rem; margin-bottom:1rem }
    h1{ color:var(--indigo); margin:0 }
    .card{ background:#fff; border:1px solid #e5e7eb; border-radius:12px; padding:1rem; box-shadow: 0 1px 2px rgba(0,0,0,.04) }
    .muted{ color:#6b7280 }
    code{ background:#f3f4f6; padding:.125rem .375rem; border-radius:.375rem }
  </style>
</head>
<body>
  <header>
    <svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M12 2l3 7h7l-5.5 4 2 7L12 17l-6.5 3 2-7L2 9h7l3-7z\" fill=\"var(--indigo)\" opacity=\".9\"/></svg>
    <h1>Generated Prototype</h1>
  </header>

  <div class=\"card\">
    <p class=\"muted\">Prompt:</p>
    <p><code>${prompt.replace(/</g, "&lt;")}</code></p>
  </div>

  <p class=\"muted\">Hint: set an <code>OPENAI_API_KEY</code> env var on the server to enable LLM-powered generation.</p>
</body>
</html>`;

    return NextResponse.json({ code: html });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
