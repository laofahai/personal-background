import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from "fs";
import { join, resolve, relative, sep } from "path";

const CORE = ["profile", "preferences", "constraints"] as const;
export type CoreName = (typeof CORE)[number];
export const CORE_NAMES: readonly CoreName[] = CORE;
export function isCoreName(name: string): name is CoreName {
  return (CORE as readonly string[]).includes(name);
}

export interface SearchHit { file: string; line: number; text: string; matchType: "content" | "tag" | "filename"; }

export const ENTRY_FILENAME_RE = /^\d{4}-\d{2}-\d{2}-[a-z0-9-]+\.md$/;

export interface AppendCoreResult {
  modified: string;
  mode: "append" | "upsert";
  frontmatterUpdated: boolean;
  last_updated: string;
  sectionHeading?: string;
  sectionExisted?: boolean;
}

export interface Repo {
  root: string;
  readCore(name: CoreName): string;
  readEntry(kind: "episodes" | "notes", filename: string): string;
  listRecent(kind: "episodes" | "notes", n: number): string[];
  searchBackground(query: string, limit?: number): SearchHit[];
  addEntry(kind: "episodes" | "notes", filename: string, content: string): void;
  appendCore(name: CoreName, content: string, sectionHeading?: string): AppendCoreResult;
  isPrivatePath(rel: string): boolean;
  isValidEntryFilename(filename: string): boolean;
}

function today(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function withLastUpdated(content: string): { content: string; updated: boolean; last_updated: string } {
  const last_updated = today();
  const match = content.match(/^(---\r?\n)([\s\S]*?)(\r?\n---[ \t]*(?:\r?\n|$))/);
  if (!match) {
    return { content: `---\nlast_updated: ${last_updated}\n---\n${content}`, updated: true, last_updated };
  }

  const [, open, body, close] = match;
  const nextBody = /^last_updated\s*:/m.test(body)
    ? body.replace(/^last_updated\s*:.*$/m, `last_updated: ${last_updated}`)
    : `${body}${body.endsWith("\n") ? "" : "\n"}last_updated: ${last_updated}`;
  return {
    content: `${open}${nextBody}${close}${content.slice(match[0].length)}`,
    updated: nextBody !== body,
    last_updated,
  };
}

function upsertSection(content: string, sectionHeading: string, body: string): { content: string; existed: boolean } {
  const heading = sectionHeading.trim();
  const headingMatch = heading.match(/^(#{1,6})\s+\S/);
  if (!headingMatch) throw new Error("section_heading must be a Markdown heading, e.g. ## Work");

  const level = headingMatch[1].length;
  const block = body.trimStart().startsWith(heading) ? body.trimEnd() : `${heading}\n\n${body.trimEnd()}`;
  const lines = content.split("\n");
  const start = lines.findIndex((line) => line.trim() === heading);
  if (start === -1) return { content: `${content.trimEnd()}\n\n${block}\n`, existed: false };

  let end = lines.length;
  const nextHeading = new RegExp(`^#{1,${level}}\\s+\\S`);
  for (let i = start + 1; i < lines.length; i++) {
    if (nextHeading.test(lines[i].trim())) {
      end = i;
      break;
    }
  }
  lines.splice(start, end - start, ...`${block}\n`.split("\n"));
  return { content: `${lines.join("\n").trimEnd()}\n`, existed: true };
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

  const searchBackground = (query: string, limit?: number): SearchHit[] => {
    const q = query.toLowerCase();
    const max = limit ?? 50;
    const hits: SearchHit[] = [];
    const addHit = (file: string, line: number, text: string, matchType: SearchHit["matchType"]) => {
      if (hits.some((h) => h.file === file && h.line === line)) return;
      hits.push({ file: relative(root, file), line, text: text.trim(), matchType });
    };
    for (const file of walk(root, [])) {
      if (hits.length >= max) break;
      const rel = relative(root, file);
      if (rel.toLowerCase().includes(q)) {
        addHit(file, 1, `filename: ${rel}`, "filename");
      }
      const content = readFileSync(file, "utf-8");
      const tagMatch = content.match(/^---\s*\n[\s\S]*?tags:\s*\[(.*?)\][\s\S]*?\n---/m);
      if (tagMatch && tagMatch[1].toLowerCase().includes(q)) {
        addHit(file, 1, `tags: ${tagMatch[1].trim()}`, "tag");
      }
      const lines = content.split("\n");
      for (let i = 0; i < lines.length; i++) {
        if (hits.length >= max) break;
        const text = lines[i];
        if (text.toLowerCase().includes(q)) {
          addHit(file, i + 1, text, "content");
        }
      }
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

  const appendCore = (name: CoreName, content: string, sectionHeading?: string): AppendCoreResult => {
    if (!isCoreName(name)) throw new Error(`Invalid core file: ${name}`);
    const p = join(root, `${name}.md`);
    const prev = existsSync(p) ? readFileSync(p, "utf-8") : "";
    const frontmatter = withLastUpdated(prev);
    const heading = sectionHeading?.trim();
    const result = heading
      ? upsertSection(frontmatter.content, heading, content)
      : { content: `${frontmatter.content.trimEnd()}\n\n${content.trimEnd()}\n`, existed: undefined };

    writeFileSync(p, result.content, "utf-8");
    return {
      modified: `${name}.md`,
      mode: heading ? "upsert" : "append",
      frontmatterUpdated: frontmatter.updated,
      last_updated: frontmatter.last_updated,
      ...(heading ? { sectionHeading: heading, sectionExisted: result.existed } : {}),
    };
  };

  return { root, readCore, readEntry, listRecent, searchBackground, addEntry, appendCore, isPrivatePath, isValidEntryFilename };
}
