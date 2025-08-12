"use client";
import { useEffect, useRef, useState } from "react";

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

// Helpers
const INDENT = 12;
const normalizeRelPath = (p: string) =>
  p
    .replace(/\\+/g, "/") // backslashes -> slashes
    .replace(/^\/+/, "") // no leading slash
    .replace(/\/+$/, ""); // no trailing slash

const sortEntries = (list: FileNode[]): FileNode[] => {
  const dirs = list
    .filter((e) => e.type === "directory")
    .sort((a, b) => a.name.localeCompare(b.name));
  const files = list
    .filter((e) => e.type === "file")
    .sort((a, b) => a.name.localeCompare(b.name));
  return [...dirs, ...files];
};

export default function FileExplorer({ onOpenFile, root = "" }: Props) {
  const [entriesCache, setEntriesCache] = useState<DirEntries>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [loadingDir, setLoadingDir] = useState<string | null>(null);

  // Abort controllers to prevent race conditions
  const listControllers = useRef<Map<string, AbortController>>(new Map());
  const readController = useRef<AbortController | null>(null);

  async function loadDir(dir: string) {
    setLoadingDir(dir);

    // Abort any in-flight request for this dir
    const prev = listControllers.current.get(dir);
    prev?.abort();
    const ac = new AbortController();
    listControllers.current.set(dir, ac);

    try {
      const url = new URL("/api/fs/list", window.location.origin);
      if (dir) url.searchParams.set("dir", dir);
      const res = await fetch(url.toString(), {
        signal: ac.signal,
        cache: "no-store",
        headers: { "Cache-Control": "no-store" },
      });

      // If a newer request started, ignore this response
      if (listControllers.current.get(dir) !== ac) return;

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        const list: FileNode[] = Array.isArray(data.entries)
          ? data.entries
          : [];
        setEntriesCache((prev) => ({ ...prev, [dir]: sortEntries(list) }));
      } else {
        console.error(data?.error || "Failed to list directory");
      }
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        console.error("List dir failed:", err);
      }
    } finally {
      if (listControllers.current.get(dir) === ac) {
        setLoadingDir(null);
        listControllers.current.delete(dir);
      }
    }
  }

  async function openFile(path: string) {
    // Abort previous read
    readController.current?.abort();
    const ac = new AbortController();
    readController.current = ac;

    try {
      const url = new URL("/api/fs/read", window.location.origin);
      url.searchParams.set("path", path);
      const res = await fetch(url.toString(), {
        signal: ac.signal,
        cache: "no-store",
        headers: { "Cache-Control": "no-store" },
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        onOpenFile({
          path,
          content: data.content || "",
          language: extToLanguage(path),
        });
      } else {
        console.error(data?.error || "Failed to read file");
      }
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        console.error("Read file failed:", err);
      }
    } finally {
      if (readController.current === ac) {
        readController.current = null;
      }
    }
  }

  async function createFolder() {
    const input = window.prompt(
      "New folder path (relative to project root):",
      root ? `${root}/new-folder` : "new-folder"
    );
    if (!input) return;
    const rel = normalizeRelPath(input);

    try {
      const res = await fetch("/api/fs/mkdir", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
        cache: "no-store",
        body: JSON.stringify({ path: rel }),
      });
      if (res.ok) {
        const parent = rel.split("/").slice(0, -1).join("/");
        // Refresh parent and root if needed
        await Promise.all([
          loadDir(parent),
          parent !== root ? loadDir(root) : Promise.resolve(),
        ]);
        setExpanded((prev) => ({ ...prev, [parent]: true, [rel]: true }));
      } else {
        const data = await res.json().catch(() => ({}));
        alert("Failed to create folder: " + (data?.error || res.statusText));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to create folder.");
    }
  }

  async function createFile() {
    const input = window.prompt(
      "New file path (relative to project root):",
      root ? `${root}/new-file.txt` : "new-file.txt"
    );
    if (!input) return;
    const rel = normalizeRelPath(input);

    try {
      const res = await fetch("/api/fs/write", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
        cache: "no-store",
        body: JSON.stringify({ path: rel, content: "" }),
      });
      if (res.ok) {
        const parent = rel.split("/").slice(0, -1).join("/");
        await Promise.all([
          loadDir(parent),
          parent !== root ? loadDir(root) : Promise.resolve(),
        ]);
        setExpanded((prev) => ({ ...prev, [parent]: true }));
        onOpenFile({ path: rel, content: "", language: extToLanguage(rel) });
      } else {
        const data = await res.json().catch(() => ({}));
        alert("Failed to create file: " + (data?.error || res.statusText));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to create file.");
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
            className="flex items-center cursor-pointer select-none py-1 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 rounded-lg transition"
            style={{ paddingLeft: depth * INDENT }}
            onClick={() => toggle(dir)}
          >
            <span className="mr-1 text-xs">
              {isOpen ? (
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M6 8l4 4 4-4" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M8 6l4 4-4 4" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              )}
            </span>
            <span className="font-medium text-indigo-700">
              <svg className="inline mr-1" width="16" height="16" viewBox="0 0 20 20" fill="none"><rect x="3" y="6" width="14" height="8" rx="2" fill="#a5b4fc"/><rect x="3" y="6" width="14" height="2" rx="1" fill="#6366f1"/></svg>
              {dir.split("/").slice(-1)[0] || "/"}
            </span>
          </div>
        )}
        {isOpen && (
          <div>
            {loadingDir === dir && !entries && (
              <div
                className="text-xs text-gray-400 py-1 animate-pulse"
                style={{ paddingLeft: (depth + 1) * INDENT }}
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
                  className="flex items-center cursor-pointer text-base font-semibold hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 rounded-lg px-2 py-2 transition group"
                  style={{ paddingLeft: (depth + 1) * INDENT }}
                  onClick={() => openFile(node.path)}
                  title={node.path}
                >
                  <span className="mr-2">
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><rect x="4" y="4" width="12" height="12" rx="2" fill="#f3f4f6" stroke="#6366f1" strokeWidth="1.5"/></svg>
                  </span>
                  <span className="truncate group-hover:text-indigo-700 text-gray-900" style={{letterSpacing: "0.01em"}}>{node.name}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto text-sm bg-gradient-to-br from-white via-blue-50 to-purple-50 rounded-xl shadow-md p-2">
      <div className="flex items-center justify-between py-2 mb-2">
        <div
          className="flex items-center cursor-pointer select-none font-bold text-indigo-700 text-base"
          onClick={() => toggle(root)}
        >
          <span className="mr-1 text-xs">
            {expanded[root] ? (
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M6 8l4 4 4-4" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M8 6l4 4-4 4" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            )}
          </span>
          <span>
            <svg className="inline mr-1" width="16" height="16" viewBox="0 0 20 20" fill="none"><rect x="3" y="6" width="14" height="8" rx="2" fill="#a5b4fc"/><rect x="3" y="6" width="14" height="2" rx="1" fill="#6366f1"/></svg>
            {root || "/"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1 text-xs bg-gradient-to-r from-indigo-200 to-purple-200 rounded-lg hover:from-indigo-300 hover:to-purple-300 text-indigo-700 font-semibold shadow transition"
            onClick={createFolder}
            title="New folder"
          >
            <svg className="inline mr-1" width="14" height="14" viewBox="0 0 20 20" fill="none"><rect x="4" y="8" width="12" height="8" rx="2" fill="#a5b4fc"/><rect x="4" y="8" width="12" height="2" rx="1" fill="#6366f1"/><path d="M10 12v4m2-2h-4" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round"/></svg>New Folder
          </button>
          <button
            className="px-3 py-1 text-xs bg-gradient-to-r from-blue-200 to-teal-200 rounded-lg hover:from-blue-300 hover:to-teal-300 text-blue-700 font-semibold shadow transition"
            onClick={createFile}
            title="New file"
          >
            <svg className="inline mr-1" width="14" height="14" viewBox="0 0 20 20" fill="none"><rect x="4" y="4" width="12" height="12" rx="2" fill="#f3f4f6" stroke="#6366f1" strokeWidth="1.5"/><path d="M10 8v4m2-2h-4" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round"/></svg>New File
          </button>
        </div>
      </div>
      {renderDir(root, 0)}
    </div>
  );
}
