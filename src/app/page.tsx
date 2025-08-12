"use client";
import { useState, useRef } from "react";
import CodeEditor from "@/components/Editor";
import Preview from "@/components/Preview";
import FileExplorer, { FileExplorerHandle } from "@/components/FileExplorer";

export default function Home() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [editorLanguage, setEditorLanguage] = useState<string>("html");
  const [saving, setSaving] = useState(false);
  const explorerRef = useRef<FileExplorerHandle | null>(null);

  async function generateCode() {
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
        cache: "no-store",
      });
      const data = await res.json();
      if (res.ok) {
        // Default open first generated file if any, else clear
        if (Array.isArray(data.saved) && data.saved.length > 0) {
          // Auto-open first .tsx else first file
          const firstTsx = data.saved.find((p: string) => p.endsWith(".tsx"));
          const openPath = firstTsx || data.saved[0];
          // Fetch content of opened file
          try {
            const rf = await fetch(
              `/api/fs/read?path=${encodeURIComponent(openPath)}`,
              { cache: "no-store" }
            );
            if (rf.ok) {
              const rj = await rf.json();
              setCode(rj.content || "");
              setCurrentFile(openPath);
              setEditorLanguage(
                openPath.endsWith(".tsx")
                  ? "typescript"
                  : openPath.endsWith(".ts")
                  ? "typescript"
                  : openPath.endsWith(".css")
                  ? "css"
                  : openPath.endsWith(".js")
                  ? "javascript"
                  : "plaintext"
              );
            }
          } catch {}
        } else if (data.code) {
          // Legacy single-file fallback
          setCode(data.code || "");
          setCurrentFile(null);
          setEditorLanguage("html");
        }
        // Refresh file explorer parents
        if (Array.isArray(data.parents) && explorerRef.current) {
          explorerRef.current.refreshParents(data.parents);
        }
      } else {
        console.error(data.error || "Failed to generate code");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function saveCode() {
    try {
      let path = currentFile || "";
      if (!path) {
        const suggested = "src/app/page.tsx";
        const input = window.prompt(
          "Save as (relative to project root):",
          suggested
        );
        if (!input) return;
        path = input.replace(/\\+/g, "/");
        setCurrentFile(path);
      }
      setSaving(true);
      const res = await fetch("/api/fs/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path, content: code }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert("Save failed: " + (data?.error || res.statusText));
      }
    } catch (e) {
      console.error(e);
      alert("Save failed");
    } finally {
      setSaving(false);
    }
  }

  function onOpenFile({
    path,
    content,
    language,
  }: {
    path: string;
    content: string;
    language: string;
  }) {
    setCurrentFile(path);
    setCode(content);
    setEditorLanguage(language);
  }

  return (
    <div className="h-screen flex flex-col">
      <header className="p-4 bg-indigo-600 text-white">
        <h1 className="text-lg font-bold">Code Generator & Preview</h1>
      </header>

      <main className="flex flex-1 min-h-0">
        <aside className="w-64 border-r p-3 overflow-auto bg-white">
          <div className="text-sm font-semibold mb-2">Files</div>
          <FileExplorer ref={explorerRef} onOpenFile={onOpenFile} root="src" />
        </aside>

        <div className="flex-1 flex min-h-0">
          <div className="w-1/2 p-4 flex flex-col">
            <div className="mb-3 flex items-center gap-3 flex-wrap">
              <input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what to build (e.g., 'A todo app with Tailwind and vanilla JS')"
                className="flex-1 min-w-0 rounded px-3 py-2 border border-gray-300 text-black placeholder:text-gray-500"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={generateCode}
                  disabled={loading || !prompt.trim()}
                  className="bg-indigo-600 text-white px-4 py-2 rounded disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "Generating..." : "Generate"}
                </button>
                <button
                  onClick={saveCode}
                  disabled={saving || !code}
                  className="bg-emerald-600 text-white px-4 py-2 rounded disabled:opacity-60 disabled:cursor-not-allowed"
                  title={currentFile ? `Save ${currentFile}` : "Save As"}
                >
                  {saving ? "Saving..." : currentFile ? "Save" : "Save As"}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <div className="truncate">
                {currentFile ?? "Generated output (unsaved)"}
              </div>
              <div className="uppercase">{editorLanguage}</div>
            </div>
            <div className="flex-1 min-h-0">
              <CodeEditor
                code={code}
                onChange={setCode}
                language={editorLanguage}
              />
            </div>
          </div>
          <div className="w-1/2 p-4 bg-gray-100">
            <div className="h-full">
              <Preview code={code} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
