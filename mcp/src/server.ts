#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from "fs";
import { join, resolve } from "path";

const REPO = process.env.PERSONAL_BACKGROUND_DIR
  ? resolve(process.env.PERSONAL_BACKGROUND_DIR)
  : resolve(process.env.HOME || "~", "Documents/workspace/personal-background");

const CORE_FILES = {
  profile: join(REPO, "profile.md"),
  preferences: join(REPO, "preferences.md"),
  constraints: join(REPO, "constraints.md"),
};

type CoreFile = keyof typeof CORE_FILES;

function readCore(name: CoreFile): string {
  const path = CORE_FILES[name];
  if (!existsSync(path)) return "";
  return readFileSync(path, "utf-8");
}

function writeCore(name: CoreFile, content: string): void {
  const path = CORE_FILES[name];
  writeFileSync(path, content, "utf-8");
}

function listDir(dir: string): string[] {
  const full = join(REPO, dir);
  if (!existsSync(full)) return [];
  return readdirSync(full)
    .filter((f) => f.endsWith(".md"))
    .sort()
    .reverse();
}

function readFileInRepo(...parts: string[]): string {
  const path = join(REPO, ...parts);
  if (!existsSync(path)) return "";
  return readFileSync(path, "utf-8");
}

function writeFileInRepo(parts: string[], content: string): void {
  const path = join(REPO, ...parts);
  const dir = join(REPO, ...parts.slice(0, -1));
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(path, content, "utf-8");
}

const server = new Server(
  {
    name: "personal-background",
    version: "1.0.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      { uri: "profile://profile", name: "Profile", mimeType: "text/markdown" },
      { uri: "preferences://preferences", name: "Preferences", mimeType: "text/markdown" },
      { uri: "constraints://constraints", name: "Constraints", mimeType: "text/markdown" },
      ...listDir("episodes").map((f) => ({
        uri: `episode://${f}`,
        name: f,
        mimeType: "text/markdown",
      })),
      ...listDir("notes").map((f) => ({
        uri: `note://${f}`,
        name: f,
        mimeType: "text/markdown",
      })),
    ],
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;
  let text = "";
  if (uri === "profile://profile") text = readCore("profile");
  else if (uri === "preferences://preferences") text = readCore("preferences");
  else if (uri === "constraints://constraints") text = readCore("constraints");
  else if (uri.startsWith("episode://")) text = readFileInRepo("episodes", uri.replace("episode://", ""));
  else if (uri.startsWith("note://")) text = readFileInRepo("notes", uri.replace("note://", ""));
  return { contents: [{ uri, mimeType: "text/markdown", text }] };
});

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "read_profile",
        description: "Read the user's profile.md",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "read_preferences",
        description: "Read the user's preferences.md",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "read_constraints",
        description: "Read the user's constraints.md",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "list_episodes",
        description: "List timestamped episodes",
        inputSchema: { type: "object", properties: {} },
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
        name: "list_notes",
        description: "List observation notes",
        inputSchema: { type: "object", properties: {} },
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
        name: "add_episode",
        description: "Add a new episode",
        inputSchema: {
          type: "object",
          properties: {
            filename: { type: "string" },
            content: { type: "string" },
          },
          required: ["filename", "content"],
        },
      },
      {
        name: "add_note",
        description: "Add a new note",
        inputSchema: {
          type: "object",
          properties: {
            filename: { type: "string" },
            content: { type: "string" },
          },
          required: ["filename", "content"],
        },
      },
      {
        name: "update_core",
        description: "Update profile.md, preferences.md, or constraints.md",
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
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  if (!args) {
    throw new Error(`Tool ${name} requires arguments`);
  }
  switch (name) {
    case "read_profile":
      return { content: [{ type: "text", text: readCore("profile") }] };
    case "read_preferences":
      return { content: [{ type: "text", text: readCore("preferences") }] };
    case "read_constraints":
      return { content: [{ type: "text", text: readCore("constraints") }] };
    case "list_episodes":
      return { content: [{ type: "text", text: listDir("episodes").join("\n") }] };
    case "read_episode":
      return { content: [{ type: "text", text: readFileInRepo("episodes", args.filename as string) }] };
    case "list_notes":
      return { content: [{ type: "text", text: listDir("notes").join("\n") }] };
    case "read_note":
      return { content: [{ type: "text", text: readFileInRepo("notes", args.filename as string) }] };
    case "add_episode":
      writeFileInRepo(["episodes", args.filename as string], args.content as string);
      return { content: [{ type: "text", text: `Episode ${args.filename} added.` }] };
    case "add_note":
      writeFileInRepo(["notes", args.filename as string], args.content as string);
      return { content: [{ type: "text", text: `Note ${args.filename} added.` }] };
    case "update_core":
      writeCore(args.file as CoreFile, args.content as string);
      return { content: [{ type: "text", text: `Core file ${args.file} updated.` }] };
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
