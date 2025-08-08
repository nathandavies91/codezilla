"use client";
import Editor from "@monaco-editor/react";

type Props = {
  code: string;
  onChange: (value: string) => void;
};

export default function CodeEditor({ code, onChange }: Props) {
  return (
    <div className="border rounded-md overflow-hidden h-full">
      <Editor
        height="100%"
        defaultLanguage="html"
        value={code}
        onChange={(val) => onChange(val || "")}
        theme="vs-dark"
      />
    </div>
  );
}
