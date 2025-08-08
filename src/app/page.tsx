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
          <FileExplorer onOpenFile={onOpenFile} root="src" />
        </aside>

        <div className="flex-1 flex min-h-0">
          <div className="w-1/2 p-4 flex flex-col">
            <div className="mb-3 flex items-center gap-3">
              <input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what to build (e.g., 'A todo app with Tailwind and vanilla JS')"
                className="flex-1 min-w-0 rounded px-3 py-2 border border-gray-300 text-black placeholder:text-gray-500"
              />
              <button
                onClick={generateCode}
                disabled={loading || !prompt.trim()}
                className="bg-indigo-600 text-white px-4 py-2 rounded disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Generating..." : "Generate"}
              </button>
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
