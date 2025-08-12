"use client";
import { useState, useRef } from "react";
import CodeEditor from "@/components/Editor";
import Preview, { PreviewHandle } from "@/components/Preview";
import FileExplorer, { FileExplorerHandle } from "@/components/FileExplorer";

export default function Home() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [editorLanguage, setEditorLanguage] = useState<string>("html");
  const [saving, setSaving] = useState(false);
  const explorerRef = useRef<FileExplorerHandle | null>(null);
  const previewRef = useRef<PreviewHandle | null>(null);

  // Function to convert file path to route
  function pathToRoute(filePath: string): string {
    // Handle Next.js app directory routing
    if (filePath.startsWith("src/app/")) {
      let route = filePath.replace("src/app", "");
      
      // Remove page.tsx, layout.tsx, etc.
      route = route.replace(/\/(page|layout|loading|error|not-found|global-error|template|default)\.(tsx?|jsx?)$/, "");
      
      // If empty route, default to "/"
      if (!route || route === "") {
        route = "/";
      }
      
      // Ensure route starts with "/"
      if (!route.startsWith("/")) {
        route = "/" + route;
      }
      
      return route;
    }
    
    // Handle pages directory routing (if applicable)
    if (filePath.startsWith("src/pages/")) {
      let route = filePath.replace("src/pages", "");
      
      // Remove file extensions
      route = route.replace(/\.(tsx?|jsx?)$/, "");
      
      // Handle index files
      if (route.endsWith("/index")) {
        route = route.replace("/index", "");
      }
      
      // If empty route, default to "/"
      if (!route || route === "") {
        route = "/";
      }
      
      // Ensure route starts with "/"
      if (!route.startsWith("/")) {
        route = "/" + route;
      }
      
      return route;
    }
    
    return "/";
  }

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
    
    // Auto-update preview route if it's a page file
    if (path.includes("/page.") || path.includes("/layout.") || path.startsWith("src/pages/")) {
      const route = pathToRoute(path);
      previewRef.current?.updateRoute(route);
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-purple-100">
      <header className="p-5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg">
        <h1 className="text-2xl font-extrabold tracking-tight drop-shadow">Code Generator & Preview</h1>
      </header>

      <main className="flex flex-1 min-h-0">
        <aside className="w-64 border-r p-4 overflow-auto bg-white/80 backdrop-blur-md shadow-md">
          <div className="text-base font-semibold mb-3 text-indigo-700">Files</div>
          <FileExplorer ref={explorerRef} onOpenFile={onOpenFile} root="src" />
        </aside>

        <div className="flex-1 flex min-h-0">
          <div className="w-1/2 p-6 flex flex-col bg-white/70 rounded-l-xl shadow-lg">
            <div className="mb-4 flex items-center gap-4 flex-wrap">
              <input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what to build (e.g., 'A todo app with Tailwind and vanilla JS')"
                className="flex-1 min-w-0 rounded-lg px-4 py-2 border border-gray-300 text-gray-900 placeholder:text-gray-400 shadow focus:ring-2 focus:ring-indigo-400 focus:outline-none bg-white/90"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={generateCode}
                  disabled={loading || !prompt.trim()}
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-5 py-2 rounded-lg shadow hover:scale-105 transition-transform disabled:opacity-60 disabled:cursor-not-allowed font-semibold"
                >
                  {loading ? "Generating..." : "Generate"}
                </button>
                <button
                  onClick={saveCode}
                  disabled={saving || !code}
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 text-white px-5 py-2 rounded-lg shadow hover:scale-105 transition-transform disabled:opacity-60 disabled:cursor-not-allowed font-semibold"
                  title={currentFile ? `Save ${currentFile}` : "Save As"}
                >
                  {saving ? "Saving..." : currentFile ? "Save" : "Save As"}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <div className="truncate">
                {currentFile ?? "Generated output (unsaved)"}
              </div>
              <div className="uppercase font-bold text-indigo-400">{editorLanguage}</div>
            </div>
            <div className="flex-1 min-h-0 rounded-lg overflow-hidden">
              <CodeEditor
                code={code}
                onChange={setCode}
                language={editorLanguage}
              />
            </div>
          </div>
          <div className="w-1/2 p-6 bg-gradient-to-br from-gray-50 via-blue-100 to-purple-200 rounded-r-xl shadow-lg">
            <div className="h-full rounded-lg overflow-hidden">
              <Preview ref={previewRef} code={code} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
