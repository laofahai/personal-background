import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from "fs";
import { join, resolve, relative, sep } from "path";

const CORE = ["profile", "preferences", "constraints"] as const;
export type CoreName = (typeof CORE)[number];
export const CORE_NAMES: readonly CoreName[] = CORE;
export function isCoreName(name: string): name is CoreName {
  return (CORE as readonly string[]).includes(name);
}

export interface SearchHit { file: string; line: number; text: string; }

export const ENTRY_FILENAME_RE = /^\d{4}-\d{2}-\d{2}-[a-z0-9-]+\.md$/;

export interface Repo {
  root: string;
  readCore(name: CoreName): string;
  readEntry(kind: "episodes" | "notes", filename: string): string;
  listRecent(kind: "episodes" | "notes", n: number): string[];
  searchBackground(query: string): SearchHit[];
  addEntry(kind: "episodes" | "notes", filename: string, content: string): void;
  isPrivatePath(rel: string): boolean;
  isValidEntryFilename(filename: string): boolean;
}

export function createRepo(rootInput: string): Repo {
  const root = resolve(rootInput);

  const isPrivatePath = (rel: string): boolean => {
    const norm = rel.split(/[\\/]/).join(sep);
    return norm === join("raw", "private") || norm.startsWith(join("raw", "private") + sep);
  };

  const readCore = (name: CoreName): string => {
    const p = join(root, `${name}.md`);
    return existsSync(p) ? readFileSync(p, "utf-8") : "";
  };

  const isValidEntryFilename = (filename: string): boolean => {
    if (filename.includes("/") || filename.includes("\\") || filename.includes("..")) return false;
    return ENTRY_FILENAME_RE.test(filename);
  };

  const readEntry = (kind: "episodes" | "notes", filename: string): string => {
    if (!isValidEntryFilename(filename)) {
      throw new Error(`Invalid entry filename: ${filename}`);
    }
    const p = join(root, kind, filename);
    return existsSync(p) ? readFileSync(p, "utf-8") : "";
  };

  const listRecent = (kind: "episodes" | "notes", n: number): string[] => {
    const dir = join(root, kind);
    if (!existsSync(dir)) return [];
    return readdirSync(dir)
      .filter((f) => f.endsWith(".md"))
      .sort()
      .reverse()
      .slice(0, n);
  };

  const walk = (dir: string, acc: string[]): string[] => {
    if (!existsSync(dir)) return acc;
    for (const name of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, name.name);
      const rel = relative(root, full);
      if (isPrivatePath(rel)) continue;
      if (name.isDirectory()) walk(full, acc);
      else if (name.name.endsWith(".md")) acc.push(full);
    }
    return acc;
  };

  const searchBackground = (query: string): SearchHit[] => {
    const q = query.toLowerCase();
    const hits: SearchHit[] = [];
    for (const file of walk(root, [])) {
      const lines = readFileSync(file, "utf-8").split("\n");
      lines.forEach((text, i) => {
        if (text.toLowerCase().includes(q)) {
          hits.push({ file: relative(root, file), line: i + 1, text: text.trim() });
        }
      });
    }
    return hits;
  };

  const addEntry = (kind: "episodes" | "notes", filename: string, content: string): void => {
    if (!isValidEntryFilename(filename)) {
      throw new Error(`Invalid entry filename: ${filename}`);
    }
    const dir = join(root, kind);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, filename), content, "utf-8");
  };

  return { root, readCore, readEntry, listRecent, searchBackground, addEntry, isPrivatePath, isValidEntryFilename };
}
