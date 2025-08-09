"use client";
import Editor from "@monaco-editor/react";

type Props = {
  code: string;
  onChange: (value: string) => void;
  language?: string;
};

export default function CodeEditor({
  code,
  onChange,
  language = "html",
}: Props) {
  return (
    <div className="border rounded-md overflow-hidden h-full">
      <Editor
        height="100%"
        defaultLanguage={language}
        language={language}
        value={code}
        onChange={(val) => onChange(val || "")}
        theme="vs-dark"
      />
    </div>
  );
}
