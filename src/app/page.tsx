"use client";
import { useState } from "react";
import CodeEditor from "@/components/Editor";
import Preview from "@/components/Preview";

export default function Home() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  async function generateCode() {
    setLoading(true);
    const res = await fetch("/api/generate", { method: "POST" });
    const data = await res.json();
    setCode(data.code);
    setLoading(false);
  }

  return (
    <div className="h-screen flex flex-col">
      <header className="p-4 bg-indigo-600 text-white flex justify-between">
        <h1 className="text-lg font-bold">Code Generator & Preview</h1>
        <button
          onClick={generateCode}
          className="bg-white text-indigo-600 px-4 py-2 rounded"
        >
          {loading ? "Generating..." : "Generate Code"}
        </button>
      </header>

      <main className="flex flex-1">
        <div className="w-1/2 p-4">
          <CodeEditor code={code} onChange={setCode} />
        </div>
        <div className="w-1/2 p-4 bg-gray-100">
          <Preview code={code} />
        </div>
      </main>
    </div>
  );
}
