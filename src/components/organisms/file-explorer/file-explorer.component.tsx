"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

import { File } from "@/components/molecules/file";
import { Folder } from "@/components/molecules/folder";

import { normalizeRelativePath, sortEntries } from "./file-explorer.helpers";
import { FileExplorerHandle, FileExplorerProps, FileNode } from "./file-explorer.types";

export const FileExplorer = forwardRef<FileExplorerHandle, FileExplorerProps>(({
  onOpenFileRequest,
  root = "",
}: FileExplorerProps, ref: any) => {
  const [entriesCache, setEntriesCache] = useState<Record<string, FileNode[]>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [loadingDirectory, setLoadingDirectory] = useState<string | null>(null);

  // Abort controllers to prevent race conditions
  const listControllers = useRef<Map<string, AbortController>>(new Map());
  const readController = useRef<AbortController | null>(null);

  const loadDirectory = async (directory: string) => {
    setLoadingDirectory(directory);

    // Abort any in-flight request for this dir
    const prev = listControllers.current.get(directory);
    prev?.abort();
    const ac = new AbortController();
    listControllers.current.set(directory, ac);

    try {
      const url = new URL("/api/fs/list", window.location.origin);

      if (directory) {
        url.searchParams.set("dir", directory);
      }

      const res = await fetch(url.toString(), {
        signal: ac.signal,
        cache: "no-store",
        headers: { "Cache-Control": "no-store" },
      });

      // If a newer request started, ignore this response
      if (listControllers.current.get(directory) !== ac) {
        return;
      }

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        const list: FileNode[] = Array.isArray(data.entries)
          ? data.entries
          : [];
        setEntriesCache((prev) => ({ ...prev, [directory]: sortEntries(list) }));
      } else {
        console.error(data?.error || "Failed to list directory");
      }
    }
    catch (err: any) {
      if (err?.name !== "AbortError") {
        console.error("List dir failed:", err);
      }
    }
    finally {
      if (listControllers.current.get(directory) === ac) {
        setLoadingDirectory(null);
        listControllers.current.delete(directory);
      }
    }
  }

  useEffect(() => {
    loadDirectory(root);
    setExpanded({ [root]: true });
  }, [root]);

  const handleCreateFileRequest = async (path?: string) => {
    path ??= root;

    const input = window.prompt("File name:");

    if (!input) {
      return;
    }

    const newFile = normalizeRelativePath(`${path}/${input}`);

    try {
      const res = await fetch("/api/fs/write", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
        cache: "no-store",
        body: JSON.stringify({ path: newFile, content: "" }),
      });

      if (res.ok) {
        const parent = newFile.split("/").slice(0, -1).join("/");
        await Promise.all([
          loadDirectory(parent),
          parent !== root ? loadDirectory(root) : Promise.resolve(),
        ]);
        setExpanded((prev) => ({ ...prev, [parent]: true }));
        onOpenFileRequest({
          content: "",
          path: newFile,
        });
      }
      else {
        const data = await res.json().catch(() => ({}));
        alert("Failed to create file: " + (data?.error || res.statusText));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to create file.");
    }
  }

  const handleCreateFolderRequest = async (path?: string) => {
    path ??= root;

    const input = window.prompt("Folder name:");

    if (!input) {
      return;
    }

    console.log(path, input)
    const newFolder = normalizeRelativePath(`${path}/${input}`);

    try {
      const res = await fetch("/api/fs/mkdir", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
        cache: "no-store",
        body: JSON.stringify({ path: newFolder }),
      });
      
      if (res.ok) {
        const parent = newFolder.split("/").slice(0, -1).join("/");
        // Refresh parent and root if needed
        await Promise.all([
          loadDirectory(parent),
          parent !== root ? loadDirectory(root) : Promise.resolve(),
        ]);
        setExpanded((prev) => ({ ...prev, [parent]: true, [newFolder]: true }));
      }
      else {
        const data = await res.json().catch(() => ({}));
        window.alert("Failed to create folder: " + (data?.error || res.statusText));
      }
    } catch (err) {
      console.error(err);
      window.alert("Failed to create folder.");
    }
  }

  async function handleOpenFileRequest(path: string) {
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
        onOpenFileRequest({
          content: data.content || "",
          path,
        });
      }
      else {
        console.error(data?.error || "Failed to read file");
      }
    }
    catch (err: any) {
      if (err?.name !== "AbortError") {
        console.error("Read file failed:", err);
      }
    }
    finally {
      if (readController.current === ac) {
        readController.current = null;
      }
    }
  }

  const refreshParents = async (parents: string[]) => {
    const unique = Array.from(new Set(parents.map((p) => p || "")));

    for (const parent of unique) {
      await loadDirectory(parent);
      setExpanded((prev) => ({ ...prev, [parent]: true }));
    }
  }

  const renderDirectory = (dir: string, isRoot?: boolean) => {
    const entries = entriesCache[dir];
    const isOpen = !!expanded[dir];

    return (
      <div key={dir} style={{ marginLeft: isRoot ? 0 : 12 }}>
        <Folder
          isOpen={isOpen}
          name={dir.split("/").slice(-1)[0] || "/" || "/"}
          onClick={() => toggleFolderVisibility(dir)}
          onCreateFileRequest={() => handleCreateFileRequest(dir)}
          onCreateFolderRequest={() => handleCreateFolderRequest(dir)}
        />
        {isOpen && (
          <div>
            {loadingDirectory === dir && !entries && (
              <div>
                Loading...
              </div>
            )}

            {entries?.map((node) => {
              if (node.type === "directory") {
                return renderDirectory(node.path);
              }
              
              return (
                <div
                  key={node.path}
                  style={{ marginLeft: 12 }}
                >
                  <File
                    onClick={() => handleOpenFileRequest(node.path)}
                    name={node.name}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  const toggleFolderVisibility = (directory: string) => {
    const willExpand = !expanded[directory];

    setExpanded((prev) => ({ ...prev, [directory]: willExpand }));

    if (willExpand && !entriesCache[directory]) {
      loadDirectory(directory);
    }
  }

  useImperativeHandle(ref, () => ({ refreshParents }));

  return renderDirectory(root, true);
})
