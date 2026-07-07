#!/usr/bin/env bun
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { createRepo, isCoreName } from "./lib.js";

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

const INSTRUCTIONS = `
You are connected to a personal-background MCP server. Use it to read the user's
profile, preferences, and constraints before making decisions, and to capture
episodes/notes when the user says something worth remembering.

Read strategy:
- General advice/planning → call read_profile, read_preferences, read_constraints.
- Specific recent events or topic → use search_background with a focused query and a small limit.
- Adding a dated event → use add_episode with filename YYYY-MM-DD-slug.md.
- Adding an observation/preference → use add_note with filename YYYY-MM-DD-slug.md.

Never read or write files under raw/private/ through this server.
`.trim();

const server = new Server(
  {
    name: "personal-background",
    version: "2.0.5",
    description: "MCP bridge for a local-first, markdown-based personal background repository.",
  },
  {
    capabilities: { tools: {} },
    instructions: INSTRUCTIONS,
  }
);

const readonly = { title: "Read", readOnlyHint: true, idempotentHint: true };
const write = { title: "Write", readOnlyHint: false, idempotentHint: false };
const overwrite = { title: "Overwrite", readOnlyHint: false, destructiveHint: true, idempotentHint: false };

const filenameSchema = {
  type: "string" as const,
  pattern: "^\\d{4}-\\d{2}-\\d{2}-[a-z0-9-]+\\.md$",
  description: "Entry filename in YYYY-MM-DD-slug.md format. Lowercase ASCII slug only.",
};

const tools = [
  {
    name: "read_profile",
    title: "Read profile",
    description: "Read the user's stable identity from profile.md (education, work, skills, goals, projects).",
    inputSchema: { type: "object" as const, properties: {} },
    annotations: readonly,
  },
  {
    name: "read_preferences",
    title: "Read preferences",
    description: "Read the user's decision preferences from preferences.md (risk tolerance, values, communication style).",
    inputSchema: { type: "object" as const, properties: {} },
    annotations: readonly,
  },
  {
    name: "read_constraints",
    title: "Read constraints",
    description: "Read the user's hard constraints from constraints.md (time, budget, geography, family, health, technology).",
    inputSchema: { type: "object" as const, properties: {} },
    annotations: readonly,
  },
  {
    name: "list_recent",
    title: "List recent entries",
    description: "List the most recent episode or note filenames, newest first. Use before read_episode/read_note if you need a specific filename.",
    inputSchema: {
      type: "object" as const,
      properties: {
        kind: {
          type: "string" as const,
          enum: ["episodes", "notes"],
          description: "Which folder to list: episodes or notes.",
        },
        n: {
          type: "number" as const,
          minimum: 1,
          maximum: 50,
          default: 10,
          description: "Number of entries to return (default 10, max 50).",
        },
      },
      required: ["kind"],
    },
    annotations: readonly,
  },
  {
    name: "search_background",
    title: "Search background",
    description: "Case-insensitive search across the user's background markdown. Searches file content, frontmatter tags, and filenames. Never searches raw/private/. Cap results with limit to save tokens.",
    inputSchema: {
      type: "object" as const,
      properties: {
        query: {
          type: "string" as const,
          description: "Keywords to search for. Supports plain words, not boolean operators.",
        },
        limit: {
          type: "number" as const,
          minimum: 1,
          maximum: 100,
          default: 50,
          description: "Maximum number of matching lines to return (default 50, max 100).",
        },
      },
      required: ["query"],
    },
    annotations: readonly,
  },
  {
    name: "read_episode",
    title: "Read episode",
    description: "Read the full contents of a specific episode by filename. Use list_recent or search_background to discover filenames.",
    inputSchema: {
      type: "object" as const,
      properties: { filename: filenameSchema },
      required: ["filename"],
    },
    annotations: readonly,
  },
  {
    name: "read_note",
    title: "Read note",
    description: "Read the full contents of a specific note by filename. Use list_recent or search_background to discover filenames.",
    inputSchema: {
      type: "object" as const,
      properties: { filename: filenameSchema },
      required: ["filename"],
    },
    annotations: readonly,
  },
  {
    name: "add_episode",
    title: "Add episode",
    description: "Create a new timestamped episode file. Use this when the user reports a specific event or decision with a date. Does NOT overwrite existing files.",
    inputSchema: {
      type: "object" as const,
      properties: {
        filename: filenameSchema,
        content: {
          type: "string" as const,
          description: "Full markdown content for the episode, including YAML frontmatter.",
        },
      },
      required: ["filename", "content"],
    },
    annotations: write,
  },
  {
    name: "add_note",
    title: "Add note",
    description: "Create a new observation or preference note. Use this when the user expresses a preference, insight, or pattern. Does NOT overwrite existing files.",
    inputSchema: {
      type: "object" as const,
      properties: {
        filename: filenameSchema,
        content: {
          type: "string" as const,
          description: "Full markdown content for the note, including YAML frontmatter.",
        },
      },
      required: ["filename", "content"],
    },
    annotations: write,
  },
  {
    name: "append_core",
    title: "Append to core file",
    description: "Append content to profile.md, preferences.md, or constraints.md. If section_heading is provided, replace that section or append it if missing.",
    inputSchema: {
      type: "object" as const,
      properties: {
        file: {
          type: "string" as const,
          enum: ["profile", "preferences", "constraints"],
          description: "Which core file to append to.",
        },
        content: {
          type: "string" as const,
          description: "Markdown text to append. Usually include a section header (e.g. ## Work) and concise bullets.",
        },
        section_heading: {
          type: "string" as const,
          description: "Optional Markdown heading to upsert, e.g. ## Work. When present, content replaces that section instead of appending a duplicate.",
        },
      },
      required: ["file", "content"],
    },
    annotations: overwrite,
  },
];

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

function ok(data: unknown): { content: Array<{ type: "text"; text: string }> } {
  return { content: [{ type: "text", text: typeof data === "string" ? data : JSON.stringify(data, null, 2) }] };
}

function err(message: string): { isError: true; content: Array<{ type: "text"; text: string }> } {
  return { isError: true, content: [{ type: "text", text: message }] };
}

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const a = (args ?? {}) as Record<string, unknown>;
  try {
    switch (name) {
      case "read_profile":
        return ok(repo.readCore("profile"));
      case "read_preferences":
        return ok(repo.readCore("preferences"));
      case "read_constraints":
        return ok(repo.readCore("constraints"));
      case "list_recent":
        return ok(repo.listRecent(a.kind as "episodes" | "notes", (a.n as number) ?? 10));
      case "search_background": {
        const hits = repo.searchBackground(a.query as string, a.limit as number | undefined);
        const grouped = hits.reduce((acc, h) => {
          acc[h.file] = acc[h.file] || [];
          acc[h.file].push(h);
          return acc;
        }, {} as Record<string, typeof hits>);
        const summary = {
          query: a.query as string,
          totalHits: hits.length,
          results: Object.entries(grouped).map(([file, lines]) => ({ file, hits: lines })),
        };
        return ok(summary);
      }
      case "add_episode": {
        const filename = a.filename as string;
        if (!repo.isValidEntryFilename(filename)) return err(`Invalid filename: ${filename}. Must match YYYY-MM-DD-slug.md.`);
        repo.addEntry("episodes", filename, a.content as string);
        return ok({ created: `episodes/${filename}` });
      }
      case "add_note": {
        const filename = a.filename as string;
        if (!repo.isValidEntryFilename(filename)) return err(`Invalid filename: ${filename}. Must match YYYY-MM-DD-slug.md.`);
        repo.addEntry("notes", filename, a.content as string);
        return ok({ created: `notes/${filename}` });
      }
      case "read_episode":
        return ok(repo.readEntry("episodes", a.filename as string));
      case "read_note":
        return ok(repo.readEntry("notes", a.filename as string));
      case "append_core": {
        const file = a.file as string;
        if (!isCoreName(file)) {
          return err(`Invalid core file: ${file}. Must be one of: profile, preferences, constraints.`);
        }
        return ok(repo.appendCore(file, a.content as string, a.section_heading as string | undefined));
      }
      default:
        return err(`Unknown tool: ${name}`);
    }
  } catch (e) {
    return err(e instanceof Error ? e.message : String(e));
  }
});

async function main() {
  await server.connect(new StdioServerTransport());
}
main().catch((e) => { console.error(e); process.exit(1); });
