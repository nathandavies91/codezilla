"use client";

import Editor, { OnMount } from "@monaco-editor/react";
import { useEffect, useState } from "react";

import { getLanguageByFilename } from "./code-editor.helpers";
import { CodeEditorProps } from "./code-editor.types";

export const CodeEditor = ({
  code: parentCode,
  filePath,
  onChange,
}: CodeEditorProps) => {
  const [code, setCode] = useState(parentCode);
  const [colorScheme, setColorScheme] = useState<"light" | "dark">("light");
  const language = getLanguageByFilename(filePath);

  useEffect(() => {
    const handleColorSchemeChange = (event: any) => {
      setColorScheme(event.matches ? "dark" : "light");
    }

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', handleColorSchemeChange);
    return window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', handleColorSchemeChange);
  }, []);

  useEffect(() => {
    onChange?.(code ?? "");
  }, [code]);

  useEffect(() => {
    setCode(parentCode);
  }, [parentCode]);

  const handleChange = (value?: string) => {
    setCode(value ?? "");
  }

  const handleEditorDidMount = (
    editor: Parameters<OnMount>[0],
    monaco: Parameters<OnMount>[1],
  ) => {
    if (monaco && filePath?.endsWith("tsx")) {
      monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        allowJs: true,
        allowNonTsExtensions: true,
        esModuleInterop: true,
        jsx: monaco.languages.typescript.JsxEmit.React,
        module: monaco.languages.typescript.ModuleKind.CommonJS,
        moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
        noEmit: true,
        reactNamespace: "React",
        target: monaco.languages.typescript.ScriptTarget.Latest,
      });

      monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: false,
        noSyntaxValidation: false,
      });
    }

    const model = monaco.editor.createModel(
      code ?? "",
      getLanguageByFilename(filePath),
      monaco.Uri.file(filePath!)
    );

    editor.setModel(model);
  }

  return (
    <Editor
      language={language}
      onChange={handleChange}
      onMount={handleEditorDidMount}
      options={{
        minimap: {
          enabled: false,
        },
      }}
      theme={colorScheme === "light" ? "light" : "vs-dark"}
      value={code}
    />
  )
}
