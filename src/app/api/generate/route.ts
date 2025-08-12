import { NextResponse } from "next/server";
import {
  writeFileContent,
  normalizeSlashes,
  NO_STORE_HEADERS,
} from "@/server/fsService";

// GET /api/generate
export async function GET(_: Request) {
  return NextResponse.json(
    { message: "Hello from Codezilla API" },
    { headers: NO_STORE_HEADERS }
  );
}

// POST /api/generate
// Body: { prompt: string }
// Behavior: Requests multi-file JSON from LLM: { files: [{ path, content }] }
// Saves each file (container-aware) and returns list of saved paths plus parent directories for UI refresh.
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
    if (!prompt) {
      return NextResponse.json(
        { error: "Missing 'prompt' in request body" },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    let files: { path: string; content: string }[] | null = null;


    // Choose LLM provider
    const provider = process.env.LLM_PROVIDER?.toLowerCase();
    if (provider === "openai" && process.env.OPENAI_API_KEY) {
      try {
        // Ask model for strict JSON with a files array tailored for Next.js
        const system = `You are a code generator for a Next.js (App Router) TypeScript project. OUTPUT ONLY strict JSON (no markdown, no backticks) matching this exact shape: { "files": [ { "path": string, "content": string } ] }. Rules:
1. Each files[i].path is a POSIX style relative path (no leading '/', no '..').
2. Provide minimal but complete set of files for the user's request.
3. Always include at least: a page component (e.g. src/app/generated/page.tsx), at least one supporting component in src/components if useful, and a CSS file (module or global) referenced by the page (e.g. src/app/generated/styles.css or a module next to a component).
4. Use React functional components with TypeScript. Default export the page component.
5. If you add components use import paths relative to project root (e.g. '@/components/MyWidget') only if alias '@' is assumed, otherwise use relative paths from the file. Prefer '@/components' alias.
6. Keep code self-contained (no external npm installs).
7. Do NOT include package.json, node_modules, lockfiles, .env, README, or test files unless explicitly requested.
8. Use modern Next.js conventions (no 'use client' unless interactivity needed).
9. Keep CSS minimal and reference it properly (import './styles.css' inside the page or use module).
10. No explanations, ONLY the JSON object.`;
        const user = `Generate the minimal set of Next.js files for this request and include their contents. Prompt: ${prompt}`;

        const completionRes = await fetch(
          "https://api.openai.com/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              temperature: 0.4,
              messages: [
                { role: "system", content: system },
                { role: "user", content: user },
              ],
            }),
          }
        );

        if (completionRes.ok) {
          const json = await completionRes.json();
          const raw = json?.choices?.[0]?.message?.content?.trim?.() || "";
          // Try direct JSON parse; if wrapped in code fences, strip them
          const cleaned = raw
            .replace(/^```(?:json)?/i, "")
            .replace(/```$/i, "")
            .trim();
          try {
            const parsed = JSON.parse(cleaned);
            if (parsed && Array.isArray(parsed.files)) {
              files = parsed.files
                .filter(
                  (f: any) =>
                    f &&
                    typeof f.path === "string" &&
                    typeof f.content === "string"
                )
                .map((f: any) => ({ path: f.path, content: f.content }));
            }
          } catch {
            // parsing failed; will fallback
          }
        } else {
          const errTxt = await completionRes.text();
          console.error("OpenAI error:", errTxt);
        }
      } catch (err) {
        console.error("Error calling OpenAI:", err);
      }
    } else if (provider === "gemini" && process.env.GEMINI_API_KEY) {
      try {
        const geminiModel = process.env.GEMINI_MODEL || "gemini-pro";
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [
                    { text: `Build this as a single HTML file:\n${prompt}` },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.7,
              },
            }),
          }
        );
        if (!geminiRes.ok) {
          const err = await geminiRes.text();
          console.error("Gemini error:", err);
        } else {
          const json = await geminiRes.json();
          // Gemini returns candidates[0].content.parts[0].text
          const content = json?.candidates?.[0]?.content?.parts?.[0]?.text?.trim?.();
          if (content) {
            return NextResponse.json({ code: content });
          }
        }
      } catch (err) {
        console.error("Error calling Gemini:", err);
      }
    }

    if (!files || files.length === 0) {
      // Fallback: single HTML file
      const safe = prompt.replace(/</g, "&lt;");
      files = [
        {
          path: "generated.html",
          content: `<!DOCTYPE html><html><head><meta charset=\"utf-8\"/><title>${safe}</title></head><body><h1>${safe}</h1><p>Set OPENAI_API_KEY to enable multi-file generation.</p></body></html>`,
        },
      ];
    }

    // Sanitize and save
    const saved: string[] = [];
    for (const f of files) {
      let p = normalizeSlashes(f.path || "").trim();
      // Remove leading slashes
      if (p.startsWith("/")) p = p.replace(/^\/+/, "");
      // Disallow parent traversal
      if (!p || p.split("/").some((seg) => seg === ".." || !seg)) continue;
      // Basic length guard
      if (p.length > 300) continue;
      try {
        await writeFileContent(p, f.content);
        saved.push(p);
      } catch (err) {
        console.error("Failed to write", p, err);
      }
    }

    if (saved.length === 0) {
      return NextResponse.json(
        { error: "No files were saved" },
        { status: 500, headers: NO_STORE_HEADERS }
      );
    }

    // Derive parent directories to help client refresh the explorer view
    const parentsSet = new Set<string>();
    for (const p of saved) {
      const parts = p.split("/");
      // root always
      parentsSet.add("");
      for (let i = 0; i < parts.length - 1; i++) {
        const dir = parts.slice(0, i + 1).join("/");
        if (dir) parentsSet.add(dir);
      }
    }
    const parents = Array.from(parentsSet).sort();

    return NextResponse.json(
      { saved, files: saved.length, parents },
      { headers: NO_STORE_HEADERS }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Unexpected error" },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
