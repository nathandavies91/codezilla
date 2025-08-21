"use client";

import { useRef, useState } from "react";

import { AppPreview, AppPreviewHandle } from "@/components/organisms/app-preview";
import { CodeEditor } from "@/components/organisms/code-editor";
import { FileExplorer, FileExplorerHandle } from "@/components/organisms/file-explorer";
import { Workspace, WorkspaceItem } from "@/components/templates/workspace";
import { pathToRoute } from "@/helpers";

export default function Page() {
  const appBaseUrl = process.env.NEXT_PUBLIC_CONTAINER_URL || "http://localhost:3001";
  const appPreviewRef = useRef<AppPreviewHandle>(null);
  const [code, setCode] = useState<string>();
  const explorerRef = useRef<FileExplorerHandle>(null);
  const [filePath, setFilePath] = useState<string>();

  const handleOpenFileRequest = ({
    content,
    path,
  }: {
    content: string;
    path: string;
  }) => {
    setFilePath(path);
    setCode(content);
    
    // Auto-update preview route if it's a page file
    if (path.includes("/page.") || path.includes("/layout.") || path.startsWith("src/pages/")) {
      const route = pathToRoute(path);
      appPreviewRef.current?.updateRoute(route);
    }
  }

  return (
    <Workspace>
      <WorkspaceItem maxWidth={300}>
        <FileExplorer
          onOpenFileRequest={handleOpenFileRequest}
          ref={explorerRef}
          root="src"
        />
      </WorkspaceItem>
      {code !== undefined ? (
        <WorkspaceItem minWidth={400}>
          <CodeEditor
            code={code}
            filePath={filePath}
          />
        </WorkspaceItem>
      ) : <></>}
      <WorkspaceItem minWidth={400}>
        <AppPreview
          appBaseUrl={appBaseUrl}
        />
      </WorkspaceItem>
    </Workspace>
  )
}
