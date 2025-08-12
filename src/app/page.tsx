"use client";
import { useState } from "react";
import CodeEditor from "@/components/Editor";
import Preview from "@/components/Preview";
import FileExplorer from "@/components/FileExplorer";

export default function Home() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [editorLanguage, setEditorLanguage] = useState<string>("html");
  const [saving, setSaving] = useState(false);

  async function generateCode() {
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (res.ok) {
        setCode(data.code || "");
        setCurrentFile(null); // viewing generated output (not tied to a file)
        setEditorLanguage("html");
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
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-purple-100">
      <header className="p-5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg">
        <h1 className="text-2xl font-extrabold tracking-tight drop-shadow">Code Generator & Preview</h1>
      </header>

      <main className="flex flex-1 min-h-0">
        <aside className="w-64 border-r p-4 overflow-auto bg-white/80 backdrop-blur-md shadow-md">
          <div className="text-base font-semibold mb-3 text-indigo-700">Files</div>
          <FileExplorer onOpenFile={onOpenFile} root="src" />
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
              <Preview code={code} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
