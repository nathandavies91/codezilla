import { FileNode } from "./file-explorer.types";

export const normalizeRelativePath = (path: string) => {
  return path
    .replace(/\\+/g, "/") // backslashes -> slashes
    .replace(/^\/+/, "") // no leading slash
    .replace(/\/+$/, "") // no trailing slash
}

export const sortEntries = (list: FileNode[]): FileNode[] => {
  const directories = list
    .filter((e) => e.type === "directory")
    .sort((a, b) => a.name.localeCompare(b.name));
  const files = list
    .filter((e) => e.type === "file")
    .sort((a, b) => a.name.localeCompare(b.name));
  return [...directories, ...files];
};
