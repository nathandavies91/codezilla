import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import {
  mkdir,
  readFile,
  readdir,
  stat,
  writeFile as writeLocalFile,
} from "node:fs/promises";
import { ensureDockerContainer } from "./dockerContainerManager";

export type FsEntry = {
  name: string;
  path: string;
  type: "file" | "directory";
};

export const NO_STORE_HEADERS = { "Cache-Control": "no-store" } as const;

export function normalizeSlashes(p: string): string {
  return (p || "").toString().replace(/\\+/g, "/");
}

export function joinPath(a: string, b: string) {
  if (!a) return b;
  if (!b) return a;
  if (a.endsWith("/")) return a + (b.startsWith("/") ? b.slice(1) : b);
  return a + "/" + b;
}

export function toRel(fromBase: string, abs: string) {
  const base = normalizeSlashes(fromBase);
  const p = normalizeSlashes(abs);
  if (p === base) return "";
  if (p.startsWith(base + "/")) return p.slice(base.length + 1);
  return p; // fallback
}

async function dockerExec(
  container: string,
  nodeCode: string,
  args: string[] = [],
  stdin?: string
): Promise<{ stdout: string; stderr: string; code: number | null }> {
  return await new Promise((resolve, reject) => {
    const child = spawn(
      "docker",
      ["exec", "-i", container, "node", "-e", nodeCode, ...args],
      { stdio: [stdin != null ? "pipe" : "ignore", "pipe", "pipe"] }
    );
    const out: Buffer[] = [];
    const err: Buffer[] = [];
    child.stdout!.on("data", (d) => out.push(Buffer.from(d)));
    child.stderr!.on("data", (d) => err.push(Buffer.from(d)));
    child.on("error", reject);
    child.on("close", (code) => {
      resolve({
        stdout: Buffer.concat(out).toString("utf8"),
        stderr: Buffer.concat(err).toString("utf8"),
        code,
      });
    });
    if (stdin != null) {
      child.stdin!.write(stdin, "utf8");
      child.stdin!.end();
    }
  });
}

function resolveContainerAbs(projectPath: string, relOrAbs: string) {
  return relOrAbs.startsWith("/") ? relOrAbs : joinPath(projectPath, relOrAbs);
}

function resolveLocalAbs(relPath: string) {
  return join(process.cwd(), relPath);
}

export async function listDir(dir: string): Promise<FsEntry[]> {
  const relOrAbs = normalizeSlashes(dir);
  const ctx = await ensureDockerContainer();

  if (ctx?.containerName) {
    const dirAbs = resolveContainerAbs(ctx.projectPath, relOrAbs);
    const code =
      "const fs=require('fs');const p=process.argv[1];const list=fs.readdirSync(p,{withFileTypes:true}).filter(d=>!d.name.startsWith('.')).map(d=>({name:d.name,type:d.isDirectory()?'directory':'file'}));process.stdout.write(JSON.stringify(list));";
    const res = await dockerExec(ctx.containerName, code, [dirAbs]);
    if (res.code !== 0)
      throw new Error(res.stderr || `docker exited with ${res.code}`);
    const parsed = JSON.parse(res.stdout || "[]") as {
      name: string;
      type: "file" | "directory";
    }[];
    const relDir = relOrAbs.startsWith("/")
      ? toRel(ctx.projectPath, dirAbs)
      : relOrAbs;
    return parsed.map((e) => ({
      name: e.name,
      type: e.type,
      path: joinPath(relDir, e.name),
    }));
  }

  // Local fallback
  const abs = resolveLocalAbs(relOrAbs);
  const names = await readdir(abs, { withFileTypes: true });
  return names
    .filter((d) => !d.name.startsWith("."))
    .map((d) => ({
      name: d.name,
      path: joinPath(relOrAbs, d.name),
      type: d.isDirectory() ? "directory" : "file",
    }));
}

export async function readFileContent(filePath: string): Promise<string> {
  const relOrAbs = normalizeSlashes(filePath);
  const ctx = await ensureDockerContainer();

  if (ctx?.containerName) {
    const abs = resolveContainerAbs(ctx.projectPath, relOrAbs);
    const code =
      "const fs=require('fs');const p=process.argv[1];process.stdout.write(fs.readFileSync(p,'utf8'));";
    const res = await dockerExec(ctx.containerName, code, [abs]);
    if (res.code !== 0)
      throw new Error(res.stderr || `docker exited with ${res.code}`);
    return res.stdout;
  }

  const abs = resolveLocalAbs(relOrAbs);
  const s = await stat(abs);
  if (!s.isFile()) throw new Error("Not a file");
  const buf = await readFile(abs);
  return buf.toString("utf8");
}

export async function writeFileContent(
  filePath: string,
  content: string
): Promise<void> {
  const relOrAbs = normalizeSlashes(filePath);
  const ctx = await ensureDockerContainer();

  if (ctx?.containerName) {
    const abs = resolveContainerAbs(ctx.projectPath, relOrAbs);
    const code =
      "const fs=require('fs'),p=process.argv[1],path=require('path');fs.mkdirSync(path.dirname(p),{recursive:true});const chunks=[];process.stdin.on('data',c=>chunks.push(c)).on('end',()=>{fs.writeFileSync(p,Buffer.concat(chunks));}).resume();";
    const res = await dockerExec(ctx.containerName, code, [abs], content);
    if (res.code !== 0)
      throw new Error(res.stderr || `docker exited with ${res.code}`);
    return;
  }

  const abs = resolveLocalAbs(relOrAbs);
  await mkdir(dirname(abs), { recursive: true });
  await writeLocalFile(abs, content, "utf8");
}

export async function mkdirpPath(dirPath: string): Promise<void> {
  const relOrAbs = normalizeSlashes(dirPath);
  const ctx = await ensureDockerContainer();

  if (ctx?.containerName) {
    const abs = resolveContainerAbs(ctx.projectPath, relOrAbs);
    const code =
      "const fs=require('fs'),p=process.argv[1];fs.mkdirSync(p,{recursive:true});";
    const res = await dockerExec(ctx.containerName, code, [abs]);
    if (res.code !== 0)
      throw new Error(res.stderr || `docker exited with ${res.code}`);
    return;
  }

  const abs = resolveLocalAbs(relOrAbs);
  await mkdir(abs, { recursive: true });
}
