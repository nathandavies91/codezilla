"use client";

import Editor from "@monaco-editor/react";
import { useEffect, useState } from "react";

import { getLanguageByFilename } from "./code-editor.helpers";
import { CodeEditorProps } from "./code-editor.types";

export const CodeEditor = ({
  code,
  filePath,
}: CodeEditorProps) => {
  const [colorScheme, setColorScheme] = useState<"light" | "dark">();
  const language = getLanguageByFilename(filePath);

  useEffect(() => {
    const handleColorSchemeChange = (event: any) => {
      setColorScheme(event.matches ? "dark" : "light");
    }

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', handleColorSchemeChange);
    return window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', handleColorSchemeChange);
  }, []);

  return (
    <>
      <section>
        <header>
          {filePath && (
            <span className="file-path">{filePath}</span>
          )}
          <div>
            Save??
          </div>
        </header>
        <Editor
          language={language}
          theme={colorScheme === "light" ? "light" : "vs-dark"}
          value={code}
        />
      </section>
      <style jsx>
        {`
          .file-path {
            flex-grow: 1;
          }
          
          header {
            display: flex;
            padding: 1em;
          }
          
          section {
            height: 100%;
            max-height: 100vh;
          }
        `}
      </style>
    </>
  )
}
