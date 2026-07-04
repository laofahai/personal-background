#!/usr/bin/env bun
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, resolve } from "path";
import { createRepo, CoreName, isCoreName } from "./lib.js";

function loadRepoPath(): string {
  if (process.env.PERSONAL_BACKGROUND_DIR) {
    return resolve(process.env.PERSONAL_BACKGROUND_DIR);
  }
  const settingsPath = resolve(process.env.HOME || ".", "personal-background", ".pbg", "settings.yml");
  if (existsSync(settingsPath)) {
    const content = readFileSync(settingsPath, "utf-8");
    const match = content.match(/^repo_path:\s*(.+)$/m);
    if (match) return resolve(match[1].trim());
  }
  return resolve(process.env.HOME || ".", "personal-background");
}

const ROOT = loadRepoPath();
const repo = createRepo(ROOT);

const server = new Server(
  { name: "personal-background", version: "2.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    { name: "read_profile", description: "Read profile.md", inputSchema: { type: "object", properties: {} } },
    { name: "read_preferences", description: "Read preferences.md", inputSchema: { type: "object", properties: {} } },
    { name: "read_constraints", description: "Read constraints.md", inputSchema: { type: "object", properties: {} } },
    {
      name: "list_recent",
      description: "List recent episodes or notes, newest first",
      inputSchema: {
        type: "object",
        properties: { kind: { type: "string", enum: ["episodes", "notes"] }, n: { type: "number" } },
        required: ["kind"],
      },
    },
    {
      name: "search_background",
      description: "Case-insensitive search across background markdown (never searches raw/private)",
      inputSchema: { type: "object", properties: { query: { type: "string" } }, required: ["query"] },
    },
    {
      name: "add_episode",
      description: "Add an episode (filename YYYY-MM-DD-slug.md)",
      inputSchema: {
        type: "object",
        properties: { filename: { type: "string" }, content: { type: "string" } },
        required: ["filename", "content"],
      },
    },
    {
      name: "add_note",
      description: "Add a note (filename YYYY-MM-DD-slug.md)",
      inputSchema: {
        type: "object",
        properties: { filename: { type: "string" }, content: { type: "string" } },
        required: ["filename", "content"],
      },
    },
    {
      name: "read_episode",
      description: "Read a specific episode by filename",
      inputSchema: {
        type: "object",
        properties: { filename: { type: "string" } },
        required: ["filename"],
      },
    },
    {
      name: "read_note",
      description: "Read a specific note by filename",
      inputSchema: {
        type: "object",
        properties: { filename: { type: "string" } },
        required: ["filename"],
      },
    },
    {
      name: "append_core",
      description: "Append content to a core file under a section header",
      inputSchema: {
        type: "object",
        properties: {
          file: { type: "string", enum: ["profile", "preferences", "constraints"] },
          content: { type: "string" },
        },
        required: ["file", "content"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const a = (args ?? {}) as Record<string, unknown>;
  const text = (t: string) => ({ content: [{ type: "text", text: t }] });
  switch (name) {
    case "read_profile": return text(repo.readCore("profile"));
    case "read_preferences": return text(repo.readCore("preferences"));
    case "read_constraints": return text(repo.readCore("constraints"));
    case "list_recent":
      return text(repo.listRecent(a.kind as "episodes" | "notes", (a.n as number) ?? 10).join("\n"));
    case "search_background":
      return text(
        repo.searchBackground(a.query as string).map((h) => `${h.file}:${h.line}: ${h.text}`).join("\n")
      );
    case "add_episode":
      repo.addEntry("episodes", a.filename as string, a.content as string);
      return text(`Episode ${a.filename} added.`);
    case "add_note":
      repo.addEntry("notes", a.filename as string, a.content as string);
      return text(`Note ${a.filename} added.`);
    case "read_episode":
      return text(repo.readEntry("episodes", a.filename as string));
    case "read_note":
      return text(repo.readEntry("notes", a.filename as string));
    case "append_core": {
      const file = a.file as string;
      if (!isCoreName(file)) {
        throw new Error(`Invalid append_core target: ${file}`);
      }
      const p = join(ROOT, `${file}.md`);
      const prev = existsSync(p) ? readFileSync(p, "utf-8") : "";
      writeFileSync(p, `${prev}\n\n${a.content as string}\n`, "utf-8");
      return text(`Appended to ${file}.md.`);
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

async function main() {
  await server.connect(new StdioServerTransport());
}
main().catch((e) => { console.error(e); process.exit(1); });
