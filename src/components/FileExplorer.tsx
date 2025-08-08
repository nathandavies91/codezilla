"use client";
import { useEffect, useMemo, useState } from "react";

export type FileNode = {
  name: string;
  path: string; // relative to project root
  type: "file" | "directory";
};

type DirEntries = Record<string, FileNode[]>; // key: dir path (relative)

type Props = {
  onOpenFile: (args: {
    path: string;
    content: string;
    language: string;
  }) => void;
  root?: string; // starting dir, default ""
};

function extToLanguage(path: string): string {
  const m = path.toLowerCase().match(/\.([a-z0-9]+)$/);
  const ext = m?.[1] || "";
  switch (ext) {
    case "ts":
    case "cts":
    case "mts":
      return "typescript";
    case "tsx":
      return "typescript";
    case "js":
    case "cjs":
    case "mjs":
      return "javascript";
    case "jsx":
      return "javascript";
    case "css":
      return "css";
    case "json":
      return "json";
    case "md":
    case "mdx":
      return "markdown";
    case "svg":
    case "xml":
      return "xml";
    case "html":
    case "htm":
      return "html";
    default:
      return "plaintext";
  }
}

export default function FileExplorer({ onOpenFile, root = "" }: Props) {
  const [entriesCache, setEntriesCache] = useState<DirEntries>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [loadingDir, setLoadingDir] = useState<string | null>(null);

  async function loadDir(dir: string) {
    setLoadingDir(dir);
    try {
      const url = new URL("/api/fs/list", window.location.origin);
      if (dir) url.searchParams.set("dir", dir);
      const res = await fetch(url.toString());
      const data = await res.json();
      if (res.ok) {
        const list: FileNode[] = data.entries || [];
        setEntriesCache((prev) => ({ ...prev, [dir]: list }));
      } else {
        console.error(data?.error || "Failed to list directory");
      }
    } finally {
      setLoadingDir(null);
    }
  }

  async function openFile(path: string) {
    const url = new URL("/api/fs/read", window.location.origin);
    url.searchParams.set("path", path);
    const res = await fetch(url.toString());
    const data = await res.json();
    if (res.ok) {
      onOpenFile({
        path,
        content: data.content || "",
        language: extToLanguage(path),
      });
    } else {
      console.error(data.error || "Failed to read file");
    }
  }

  async function createFolder() {
    const input = window.prompt(
      "New folder path (relative to project root):",
      root ? `${root}/new-folder` : "new-folder"
    );
    if (!input) return;
    const rel = input.replace(/\\+/g, "/");
    const res = await fetch("/api/fs/mkdir", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: rel }),
    });
    if (res.ok) {
      const parent = rel.split("/").slice(0, -1).join("/");
      await Promise.all([loadDir(parent), loadDir(parent || "")]);
      setExpanded((prev) => ({ ...prev, [parent]: true, [rel]: true }));
    } else {
      const data = await res.json().catch(() => ({}));
      alert("Failed to create folder: " + (data?.error || res.statusText));
    }
  }

  async function createFile() {
    const input = window.prompt(
      "New file path (relative to project root):",
      root ? `${root}/new-file.txt` : "new-file.txt"
    );
    if (!input) return;
    const rel = input.replace(/\\+/g, "/");
    const res = await fetch("/api/fs/write", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: rel, content: "" }),
    });
    if (res.ok) {
      const parent = rel.split("/").slice(0, -1).join("/");
      await Promise.all([loadDir(parent), loadDir(parent || "")]);
      setExpanded((prev) => ({ ...prev, [parent]: true }));
      onOpenFile({ path: rel, content: "", language: extToLanguage(rel) });
    } else {
      const data = await res.json().catch(() => ({}));
      alert("Failed to create file: " + (data?.error || res.statusText));
    }
  }

  function toggle(dir: string) {
    const willExpand = !expanded[dir];
    setExpanded((prev) => ({ ...prev, [dir]: willExpand }));
    if (willExpand && !entriesCache[dir]) {
      loadDir(dir);
    }
  }

  useEffect(() => {
    // Load root on mount
    loadDir(root);
    setExpanded({ [root]: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [root]);

  function renderDir(dir: string, depth: number) {
    const entries = entriesCache[dir];
    const isOpen = !!expanded[dir];
    return (
      <div key={dir}>
        {dir !== root && (
          <div
            className="flex items-center cursor-pointer select-none py-1"
            style={{ paddingLeft: depth * 12 }}
            onClick={() => toggle(dir)}
          >
            <span className="mr-1 text-xs">{isOpen ? "▼" : "▶"}</span>
            <span className="font-medium">
              {dir.split("/").slice(-1)[0] || "/"}
            </span>
          </div>
        )}
        {isOpen && (
          <div>
            {loadingDir === dir && !entries && (
              <div
                className="text-xs text-gray-500 py-1"
                style={{ paddingLeft: (depth + 1) * 12 }}
              >
                Loading...
              </div>
            )}
            {entries?.map((node) => {
              if (node.type === "directory") {
                return renderDir(node.path, depth + 1);
              }
              return (
                <div
                  key={node.path}
                  className="flex items-center cursor-pointer text-sm hover:bg-gray-100 rounded px-1 py-0.5"
                  style={{ paddingLeft: (depth + 1) * 12 }}
                  onClick={() => openFile(node.path)}
                  title={node.path}
                >
                  <span className="mr-1">📄</span>
                  <span className="truncate">{node.name}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto text-sm">
      <div className="flex items-center justify-between py-1">
        <div
          className="flex items-center cursor-pointer select-none font-medium"
          onClick={() => toggle(root)}
        >
          <span className="mr-1 text-xs">{expanded[root] ? "▼" : "▶"}</span>
          <span>{root || "/"}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
            onClick={createFolder}
            title="New folder"
          >
            New Folder
          </button>
          <button
            className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
            onClick={createFile}
            title="New file"
          >
            New File
          </button>
        </div>
      </div>
      {renderDir(root, 0)}
    </div>
  );
}
