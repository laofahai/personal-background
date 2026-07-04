# Personal Background v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `personal-background` as a lean local-first kit (bootstrap prompt + `kit/` material) with a first-class MCP bridge, so any agent can scaffold it and read/write the user's background from any project.

**Architecture:** The repo is both a kit and the user's git-synced markdown data home. A bootstrap prompt (pasted into the user's agent) scaffolds data files, installs skills into the agent skill dir, and registers the MCP server, all pointing at the repo path. Markdown is the only source of truth; the MCP server and skills are two access surfaces over it.

**Tech Stack:** Markdown + YAML frontmatter (data & skills), TypeScript + `@modelcontextprotocol/sdk` (MCP server, stdio), Node 20, `vitest` (MCP tests).

## Global Constraints

- Repo framework files are English: `kit/`, `methodology.md`, `bootstrap/`, `AGENTS.md`, `README.md`, `docs/`, `LICENSE`.
- User-owned paths are NEVER overwritten by any tool: `profile.md`, `preferences.md`, `constraints.md`, `episodes/`, `notes/`, `raw/`, `archive/`, `.pbg/`, `index/`.
- All user-data writes use the preferred language stored in `.pbg/settings.yml`.
- `raw/private/` is never read, written, or referenced by the MCP server.
- Filenames for episodes/notes: `YYYY-MM-DD-slug.md`, lowercase ASCII slug.
- Markdown stays 100% portable (standard YAML frontmatter, no tool-specific syntax). No third-party integration code in the repo.
- Node 20, `"type": "module"`, MCP SDK `^1.0.0`.
- Frequent commits: one commit per completed task.

---

## Phase 0: Repository restructure

### Task 0: Remove legacy scripts and stage clean-slate layout

**Files:**
- Remove: `scripts/reflect.py`, `scripts/migrate-agent.py`, `scripts/init.sh`
- Keep for now (migrated later): `templates/*`, `mcp/*`, root skills
- Verify: `git status`

- [ ] **Step 1: Confirm working tree state**

Run: `git status --porcelain`
Expected: note any pre-existing uncommitted changes; do not discard them.

- [ ] **Step 2: Remove the Python/shell scripts (replaced by skills/MCP)**

Run:
```bash
git rm scripts/reflect.py scripts/migrate-agent.py scripts/init.sh
```
Expected: three deletions staged.

- [ ] **Step 3: Commit**

```bash
git commit -m "chore: remove legacy scripts (replaced by skills + MCP)"
```

---

## Phase 1: Kit layout, manifest, templates, settings

### Task 1: Create the `kit/` skeleton and manifest

**Files:**
- Create: `kit/manifest.yml`
- Create: `kit/config/settings.example.yml`

**Interfaces:**
- Produces: `kit/manifest.yml` with `kit_version` (semver string) and `changelog` (list). The `upgrade` skill (Task 9) reads `kit_version`.
- Produces: `.pbg/settings.yml` schema (keys: `preferred_language`, `repo_path`, `kit_version`, `index.enabled`).

- [ ] **Step 1: Create `kit/manifest.yml`**

```yaml
# Manifest for the personal-background kit.
# The upgrade skill compares kit_version here (upstream) against
# .pbg/settings.yml kit_version (installed) to decide what to merge.
kit_version: "2.0.0"
changelog:
  - version: "2.0.0"
    date: "2026-07-04"
    notes:
      - "Clean-slate kit: bootstrap prompt, kit/ layout."
      - "First-class MCP bridge with search and language awareness."
      - "New skills: localize, import, upgrade."
```

- [ ] **Step 2: Create `kit/config/settings.example.yml`**

```yaml
# Copied to .pbg/settings.yml during bootstrap, then filled in.
# .pbg/ is user-owned and gitignored.
preferred_language: "en"        # e.g. en, zh, ja - used for all user-data writes
repo_path: ""                   # absolute path to this repo (the data home)
kit_version: "2.0.0"            # set to kit/manifest.yml kit_version at install time
index:
  enabled: false                # optional regenerable index (vector/graph); off by default
```

- [ ] **Step 3: Commit**

```bash
git add kit/manifest.yml kit/config/settings.example.yml
git commit -m "feat(kit): add manifest and settings example"
```

### Task 2: Move data templates into `kit/templates/`

**Files:**
- Move: `templates/profile-template.md` → `kit/templates/profile-template.md`
- Move: `templates/preferences-template.md` → `kit/templates/preferences-template.md`
- Move: `templates/constraints-template.md` → `kit/templates/constraints-template.md`
- Move: `templates/episode-template.md` → `kit/templates/episode-template.md`
- Move: `templates/note-template.md` → `kit/templates/note-template.md`

- [ ] **Step 1: Move the five templates with git**

Run:
```bash
mkdir -p kit/templates
git mv templates/profile-template.md kit/templates/profile-template.md
git mv templates/preferences-template.md kit/templates/preferences-template.md
git mv templates/constraints-template.md kit/templates/constraints-template.md
git mv templates/episode-template.md kit/templates/episode-template.md
git mv templates/note-template.md kit/templates/note-template.md
```
Expected: five renames staged; `templates/` becomes empty (except any untracked `templates/skills/`).

- [ ] **Step 2: Verify templates carry YAML frontmatter**

Run: `head -12 kit/templates/episode-template.md`
Expected: frontmatter with `date`, `type`, `tags`, `impact`, `processed` keys. If missing, add per `methodology.md` conventions.

- [ ] **Step 3: Commit**

```bash
git add -A kit/templates
git commit -m "feat(kit): move data templates into kit/templates"
```

### Task 3: Update `.gitignore` for user-owned generated paths

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: Ensure these entries exist in `.gitignore`**

Append if absent:
```gitignore
# Local runtime config and regenerable artifacts
.pbg/
index/
raw/private/
mcp/node_modules/
mcp/dist/
```

- [ ] **Step 2: Verify**

Run: `git check-ignore -v .pbg/settings.yml index/x raw/private/x`
Expected: each path reported as ignored.

- [ ] **Step 3: Commit**

```bash
git add .gitignore
git commit -m "chore: gitignore user-owned runtime paths"
```

---

## Phase 2: Skills (migrate existing + add new) under `kit/skills/`

Each skill lives at `kit/skills/<name>/SKILL.md` with YAML frontmatter (`name`, `description`, `user-invocable: true`). The bootstrap installs copies into the agent skill dir with the repo path injected.

### Task 4: Migrate the four existing skills into `kit/skills/`

**Files:**
- Create: `kit/skills/personal-profile/SKILL.md` (from existing `templates/skills/personal-profile.md` or `.factory/skills/personal-profile/SKILL.md`)
- Create: `kit/skills/complete-profile/SKILL.md`
- Create: `kit/skills/reflect/SKILL.md`
- Create: `kit/skills/setup-agent/SKILL.md`

**Interfaces:**
- Produces: four `SKILL.md` files. Each MUST include a "Repo path" rule: "Operate on the repo at the path recorded in `.pbg/settings.yml` `repo_path`; if run standalone, ask the user for the path." and a "Preferred language" rule: "Write all user data in the `preferred_language` from `.pbg/settings.yml`."

- [ ] **Step 1: Locate the current skill sources**

Run: `ls templates/skills/ .factory/skills/ 2>/dev/null`
Expected: find the existing bodies of personal-profile, complete-profile, reflect, setup-agent.

- [ ] **Step 2: Copy each into `kit/skills/<name>/SKILL.md`**

Run:
```bash
mkdir -p kit/skills/personal-profile kit/skills/complete-profile kit/skills/reflect kit/skills/setup-agent
```
Then copy each source body into the matching `SKILL.md`, preserving its frontmatter and content.

- [ ] **Step 3: Add the two global rules to each SKILL.md**

Insert this block near the top of each of the four `SKILL.md` files (after frontmatter, before the first `##`):

```markdown
## Repo & language

- Operate on the repo whose absolute path is in `.pbg/settings.yml` under `repo_path`. If that file is absent (skill run standalone), ask the user for the repo path before writing.
- Write all user data in the `preferred_language` from `.pbg/settings.yml`. Keep each file internally consistent in one language.
- Never read or write `raw/private/`.
```

- [ ] **Step 4: Verify frontmatter validity**

Run: `head -5 kit/skills/reflect/SKILL.md`
Expected: `---`, `name: reflect`, a `description:`, `user-invocable: true`, `---`.

- [ ] **Step 5: Commit**

```bash
git add kit/skills/personal-profile kit/skills/complete-profile kit/skills/reflect kit/skills/setup-agent
git commit -m "feat(skills): migrate core skills into kit/skills"
```

### Task 5: Add the `localize` skill

**Files:**
- Create: `kit/skills/localize/SKILL.md`

- [ ] **Step 1: Write `kit/skills/localize/SKILL.md`**

```markdown
---
name: localize
description: Localize the project docs into the user's preferred language, or convert the user's own data between languages. Use when the user says "translate my background", "localize the docs", "生成中文文档", or asks to change the language of any file here.
user-invocable: true
---

# Localize Skill

Produce preferred-language versions of content in the personal-background repo. The English framework files remain the canonical source; localized project docs are copies.

## Repo & language

- Operate on the repo whose absolute path is in `.pbg/settings.yml` under `repo_path`. If absent, ask the user.
- Read `preferred_language` from `.pbg/settings.yml` as the default target language; the user may override per request.
- Never touch `raw/private/`.

## Two modes

1. **Localize project docs (copies):** translate framework docs (e.g. `README.md`, `methodology.md`, a `SKILL.md` description) into the target language, writing to a sibling file with a language suffix (e.g. `README.zh.md`). Never edit the English source.
2. **Convert user data (in place, with consent):** translate user-owned files (`profile.md`, `preferences.md`, `constraints.md`, `episodes/*`, `notes/*`) into the target language. Present a plan and get explicit confirmation before writing, because this rewrites user-owned files.

## Workflow

1. Determine mode (project docs vs user data) and target language.
2. List the files that will be produced or changed.
3. For user-data conversion, show a diff/summary and wait for explicit confirmation.
4. Write localized files. For project docs use the `.<lang>.md` suffix; for user data update in place and set `last_updated` where the file has it.
5. Report what was created or changed.

## Rules

- Preserve YAML frontmatter keys; translate only human-readable values where appropriate.
- Keep filenames ASCII (`README.zh.md` is fine; do not create non-ASCII filenames).
- Do not invent facts during translation; keep meaning faithful.
```

- [ ] **Step 2: Commit**

```bash
git add kit/skills/localize
git commit -m "feat(skills): add localize skill"
```

### Task 6: Add the `import` skill (generic external-source conventions)

**Files:**
- Create: `kit/skills/import/SKILL.md`

- [ ] **Step 1: Write `kit/skills/import/SKILL.md`**

```markdown
---
name: import
description: Import background material from an external markdown source (a notes folder, a vault, an exported file) and distill it into episodes/notes. Use when the user says "import my notes", "pull from my vault", "ingest this folder", or points at external markdown to fold in.
user-invocable: true
---

# Import Skill

Distill markdown from an external source into the personal-background methodology. This is channel-agnostic: it works with any folder of markdown (a plain notes dir, a synced vault, an export). No tool-specific integration is assumed.

## Repo & language

- Operate on the repo at `.pbg/settings.yml` `repo_path`. If absent, ask the user.
- Write distilled output in `preferred_language`.
- Never touch `raw/private/`.

## Input contract

- The user provides a source path (a directory or file of markdown).
- Files may or may not have frontmatter. Treat body text as raw material.

## Workflow

1. Ask for (or confirm) the source path and scope (which files/date range).
2. Read the source markdown. Do NOT bulk-copy verbatim.
3. Distill per methodology:
   - Specific dated event → propose `episodes/YYYY-MM-DD-slug.md`.
   - Preference/observation/insight → propose `notes/YYYY-MM-DD-slug.md`.
   - Stable identity fact → propose an edit to `profile.md`/`preferences.md`/`constraints.md`.
4. Present a concise plan: source item → target file → one-line summary.
5. Wait for explicit confirmation.
6. Write files with proper frontmatter and ASCII slugs; set `processed: false`.
7. Report what was created and suggest running `reflect` afterward.

## Rules

- Extract signal; keep each episode/note 300-800 words.
- Add `confidence: low/medium/high` on notes when the claim is uncertain.
- Rephrase embellished claims into verifiable facts.
- Never import secrets or move anything into `raw/private/` automatically.
```

- [ ] **Step 2: Commit**

```bash
git add kit/skills/import
git commit -m "feat(skills): add import skill"
```

### Task 7: Add the `upgrade` skill

**Files:**
- Create: `kit/skills/upgrade/SKILL.md`

**Interfaces:**
- Consumes: `kit/manifest.yml` `kit_version` (upstream) and `.pbg/settings.yml` `kit_version` (installed).

- [ ] **Step 1: Write `kit/skills/upgrade/SKILL.md`**

```markdown
---
name: upgrade
description: Apply upstream kit updates into the user's repo via a reasoned merge, never a blind overwrite. Use when the user says "upgrade my personal-background", "pull the latest kit", "update the framework", or asks to get new skills/templates from upstream.
user-invocable: true
---

# Upgrade Skill

The repo is both a kit and the user's data home. A plain `git pull` would entangle upstream changes with user data and customizations. This skill performs a consent-gated, reasoned merge of framework-owned files only.

## Absolute rules

- **User consent is mandatory.** Upgrades are user-initiated (never automatic). Nothing is written until the user explicitly approves the merge plan.
- **Only framework-owned paths may change:** `kit/`, `methodology.md`, `bootstrap/`, `AGENTS.md`, `README.md`, `docs/`, `LICENSE`.
- **Never touch user-owned paths:** `profile.md`, `preferences.md`, `constraints.md`, `episodes/`, `notes/`, `raw/`, `archive/`, `.pbg/`, `index/`.

## Repo path

- Operate on the repo at `.pbg/settings.yml` `repo_path`. If absent, ask the user.

## Workflow

1. Determine the upstream source: prefer a git remote named `upstream`; if absent, ask the user for the upstream repo URL and add it (`git remote add upstream <url>`).
2. Fetch upstream without merging: `git fetch upstream`.
3. Read installed version (`.pbg/settings.yml` `kit_version`) and upstream version (`upstream/main:kit/manifest.yml` `kit_version`). If equal, report "already up to date" and stop.
4. Compute the changed framework-owned files between installed state and upstream (e.g. `git diff --name-only HEAD upstream/main -- kit/ methodology.md bootstrap/ AGENTS.md README.md docs/ LICENSE`).
5. Build a merge plan classifying each changed file as:
   - **New** (exists upstream, not locally) → will be added.
   - **Clean update** (user did not customize locally) → will be replaced with upstream.
   - **Conflict** (user customized this framework file) → show upstream vs local side by side and propose a three-way merge.
6. Present the plan plus the upstream changelog entries (from `kit/manifest.yml`).
7. Wait for explicit approval. The user may accept all, accept selectively, or cancel.
8. Apply only the approved changes to framework-owned paths. For conflicts, apply the agreed merged content.
9. Re-install updated skills into the agent skill dir (see setup-agent) and, if the MCP interface changed, update the MCP registration.
10. Write the new `kit_version` into `.pbg/settings.yml`.
11. Report exactly what changed and what was skipped.

## Guarantee

Never blind-overwrites. User data and customizations are preserved or surfaced as conflicts for the user to resolve.
```

- [ ] **Step 2: Commit**

```bash
git add kit/skills/upgrade
git commit -m "feat(skills): add upgrade skill"
```

### Task 8: Remove the now-migrated legacy skill locations

**Files:**
- Remove: `.factory/skills/*` (if tracked), `templates/skills/*` (if tracked)

- [ ] **Step 1: Check what is tracked**

Run: `git ls-files .factory/skills templates/skills`
Expected: a list (possibly empty). Only remove tracked duplicates now that `kit/skills/` is canonical.

- [ ] **Step 2: Remove tracked legacy skill copies**

Run (only for paths that Step 1 listed):
```bash
git rm -r .factory/skills 2>/dev/null || true
```
Do NOT delete untracked `templates/skills/` created by the user; if untracked, leave it. Confirm with `git status` before any `rm`.

- [ ] **Step 3: Commit**

```bash
git commit -m "chore: remove legacy skill copies (canonical is kit/skills)"
```

---

## Phase 3: MCP server (first-class daily bridge)

Refactor the existing `mcp/` into a testable `lib.ts` (pure functions over a repo dir) + `server.ts` (wiring), add `search_background`, `list_recent`, settings-based language, and a hard `raw/private/` guard.

### Task 9: Scaffold MCP test tooling and extract `lib.ts`

**Files:**
- Modify: `mcp/package.json`
- Create: `mcp/src/lib.ts`
- Create: `mcp/vitest.config.ts`
- Create: `mcp/test/lib.test.ts`

**Interfaces:**
- Produces (from `lib.ts`):
  - `createRepo(root: string): Repo`
  - `Repo.readCore(name: "profile"|"preferences"|"constraints"): string`
  - `Repo.listRecent(kind: "episodes"|"notes", n: number): string[]`
  - `Repo.searchBackground(query: string): { file: string; line: number; text: string }[]`
  - `Repo.addEntry(kind: "episodes"|"notes", filename: string, content: string): void`
  - `Repo.isPrivatePath(rel: string): boolean`

- [ ] **Step 1: Add vitest to `mcp/package.json`**

Set `devDependencies` to include vitest and add scripts:
```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "vitest run"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "vitest": "^2.0.0"
  }
}
```
Run: `cd mcp && npm install`
Expected: vitest installed.

- [ ] **Step 2: Create `mcp/vitest.config.ts`**

```typescript
import { defineConfig } from "vitest/config";
export default defineConfig({ test: { environment: "node" } });
```

- [ ] **Step 3: Write the failing test `mcp/test/lib.test.ts`**

```typescript
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, writeFileSync, mkdirSync, readFileSync, existsSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { createRepo } from "../src/lib.js";

let root: string;
beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "pb-"));
  writeFileSync(join(root, "profile.md"), "# Profile\nStaff engineer.");
  mkdirSync(join(root, "episodes"));
  mkdirSync(join(root, "notes"));
  mkdirSync(join(root, "raw", "private"), { recursive: true });
  writeFileSync(join(root, "episodes", "2026-01-01-a.md"), "moved to company B");
  writeFileSync(join(root, "episodes", "2026-02-01-b.md"), "launched project X");
  writeFileSync(join(root, "raw", "private", "secret.md"), "secret company B info");
});
afterEach(() => rmSync(root, { recursive: true, force: true }));

describe("Repo", () => {
  it("reads a core file", () => {
    expect(createRepo(root).readCore("profile")).toContain("Staff engineer");
  });
  it("lists recent episodes newest-first", () => {
    expect(createRepo(root).listRecent("episodes", 1)).toEqual(["2026-02-01-b.md"]);
  });
  it("searches background but never returns raw/private matches", () => {
    const hits = createRepo(root).searchBackground("company B");
    expect(hits.some((h) => h.file.includes("2026-01-01-a.md"))).toBe(true);
    expect(hits.some((h) => h.file.includes("private"))).toBe(false);
  });
  it("adds an entry", () => {
    createRepo(root).addEntry("notes", "2026-03-01-x.md", "prefers tests first");
    expect(readFileSync(join(root, "notes", "2026-03-01-x.md"), "utf-8")).toContain("tests first");
  });
  it("flags private paths", () => {
    expect(createRepo(root).isPrivatePath("raw/private/secret.md")).toBe(true);
    expect(createRepo(root).isPrivatePath("episodes/x.md")).toBe(false);
  });
});
```

- [ ] **Step 4: Run the test to confirm it fails**

Run: `cd mcp && npm test`
Expected: FAIL - cannot import `createRepo` from `../src/lib.js`.

- [ ] **Step 5: Implement `mcp/src/lib.ts`**

```typescript
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from "fs";
import { join, resolve, relative, sep } from "path";

const CORE = ["profile", "preferences", "constraints"] as const;
export type CoreName = (typeof CORE)[number];

export interface SearchHit { file: string; line: number; text: string; }

export interface Repo {
  root: string;
  readCore(name: CoreName): string;
  listRecent(kind: "episodes" | "notes", n: number): string[];
  searchBackground(query: string): SearchHit[];
  addEntry(kind: "episodes" | "notes", filename: string, content: string): void;
  isPrivatePath(rel: string): boolean;
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
    const dir = join(root, kind);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, filename), content, "utf-8");
  };

  return { root, readCore, listRecent, searchBackground, addEntry, isPrivatePath };
}
```

- [ ] **Step 6: Run the test to confirm it passes**

Run: `cd mcp && npm test`
Expected: PASS (5 tests).

- [ ] **Step 7: Commit**

```bash
git add mcp/package.json mcp/package-lock.json mcp/vitest.config.ts mcp/src/lib.ts mcp/test/lib.test.ts
git commit -m "feat(mcp): extract testable lib with search and private guard"
```

### Task 10: Rewire `server.ts` on `lib.ts` and expose the tool set

**Files:**
- Modify: `mcp/src/server.ts`
- Modify: `mcp/README.md`

**Interfaces:**
- Consumes: `createRepo` from `lib.ts`.
- Produces: MCP tools `read_profile`, `read_preferences`, `read_constraints`, `list_recent`, `search_background`, `add_episode`, `add_note`, `append_core`. Repo root from `PERSONAL_BACKGROUND_DIR` env (falls back to `~/personal-background`).

- [ ] **Step 1: Rewrite `mcp/src/server.ts`**

```typescript
#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, resolve } from "path";
import { createRepo, CoreName } from "./lib.js";

const ROOT = process.env.PERSONAL_BACKGROUND_DIR
  ? resolve(process.env.PERSONAL_BACKGROUND_DIR)
  : resolve(process.env.HOME || ".", "personal-background");
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
    case "append_core": {
      const file = a.file as CoreName;
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
```

- [ ] **Step 2: Build to verify types**

Run: `cd mcp && npm run build`
Expected: `dist/server.js` and `dist/lib.js` produced, no TS errors.

- [ ] **Step 3: Re-run tests**

Run: `cd mcp && npm test`
Expected: PASS.

- [ ] **Step 4: Update `mcp/README.md`**

Document: purpose (daily cross-project bridge), `PERSONAL_BACKGROUND_DIR` env, the tool list, and the registration command `droid mcp add personal-background -- node <repo>/mcp/dist/server.js` (with env). State clearly it never reads `raw/private/`.

- [ ] **Step 5: Commit**

```bash
git add mcp/src/server.ts mcp/README.md
git commit -m "feat(mcp): rewire server on lib, add search/list_recent/append_core"
```

---

## Phase 4: Bootstrap prompt, docs, integration

### Task 11: Write the canonical bootstrap prompt

**Files:**
- Create: `bootstrap/PROMPT.md`

- [ ] **Step 1: Write `bootstrap/PROMPT.md`**

```markdown
# Personal Background - Bootstrap Prompt

Paste this whole block into your AI coding agent from inside the cloned repo.

---

You are setting up my personal-background system. This repository is BOTH a kit and my
git-synced markdown data home. Do the following, asking me for confirmation before any write:

1. Read `kit/manifest.yml`, `methodology.md`, and `AGENTS.md` to understand the system.
2. Ask me for my **preferred language** (e.g. en, zh). Then create `.pbg/settings.yml`
   by copying `kit/config/settings.example.yml` and filling in:
   - `preferred_language`: my answer
   - `repo_path`: the absolute path of this repo (detect it)
   - `kit_version`: the `kit_version` from `kit/manifest.yml`
3. If they do not already exist, create my core files from `kit/templates/`:
   `profile.md`, `preferences.md`, `constraints.md`, and the directories
   `episodes/`, `notes/`, `raw/public/`, `raw/private/`, `archive/`.
   NEVER overwrite any of these if they already exist.
4. Detect which agent you are (Factory/Claude/Codex/Cursor/...). Install each skill in
   `kit/skills/*/SKILL.md` into this agent's skill directory. Where a skill references
   the repo path, it reads `.pbg/settings.yml` `repo_path`, so no path hardcoding is needed.
5. Register the MCP server so I can read/write my background from ANY project:
   - Build it: `cd mcp && npm install && npm run build`
   - Register with env `PERSONAL_BACKGROUND_DIR=<repo_path>` pointing to this repo, e.g.
     `droid mcp add personal-background --env PERSONAL_BACKGROUND_DIR=<repo_path> -- node <repo_path>/mcp/dist/server.js`
   - Adapt the command to my actual agent if different.
6. Tell me I can now either run the `complete-profile` skill for guided onboarding, or
   just talk to you and say "remember this" to capture episodes/notes.

Rules:
- Framework-owned files (`kit/`, `methodology.md`, `bootstrap/`, `AGENTS.md`, `README.md`,
  `docs/`, `LICENSE`) are yours to install/read; user-owned files are never overwritten.
- Write my data in my preferred language. Never read or upload `raw/private/`.
- Show me a short plan before writing anything.
```

- [ ] **Step 2: Commit**

```bash
git add bootstrap/PROMPT.md
git commit -m "feat(bootstrap): add canonical bootstrap prompt"
```

### Task 12: Update README, AGENTS.md, and methodology cross-references

**Files:**
- Modify: `README.md`
- Modify: `README.zh.md`
- Modify: `AGENTS.md`
- Modify: `methodology.md`

- [ ] **Step 1: Rewrite `README.md`**

Include, in order: one-paragraph what/why; a "Quick Start" that says clone → open the repo in your agent → paste `bootstrap/PROMPT.md`; the new repository structure (kit/, bootstrap/, mcp/, generated data files); the file ownership contract (framework vs user); a "Two access surfaces" section (MCP bridge + skills); a "Language" note (English canonical, preferred language for data, `localize` skill); a "Sync" note (git private repo or any markdown-compatible sync); an "Upgrade" note pointing at the `upgrade` skill. Embed the bootstrap prompt or link to `bootstrap/PROMPT.md`.

- [ ] **Step 2: Regenerate `README.zh.md`**

Use the `localize` approach: a faithful Chinese translation of the new `README.md`. Keep it a copy; English `README.md` stays canonical.

- [ ] **Step 3: Update `AGENTS.md`**

Add: the file ownership contract; that skills live in `kit/skills/` and are installed by bootstrap; that the MCP server is the daily cross-project bridge and reads config from `.pbg/settings.yml`/`PERSONAL_BACKGROUND_DIR`; reaffirm privacy (`raw/private/` never leaves the machine).

- [ ] **Step 4: Update `methodology.md`**

Add a short "Access surfaces" subsection (MCP bridge for daily cross-project use; skills for guided maintenance) and an "Upgrades" subsection (kit vs data ownership; use the `upgrade` skill, consent-gated). Keep the existing methodology intact.

- [ ] **Step 5: Commit**

```bash
git add README.md README.zh.md AGENTS.md methodology.md
git commit -m "docs: rewrite README/AGENTS/methodology for v2 kit + MCP"
```

### Task 13: End-to-end dry-run verification

**Files:**
- None (verification only)

- [ ] **Step 1: Simulate bootstrap data scaffolding into a temp dir**

Run:
```bash
tmp=$(mktemp -d)
cp kit/templates/profile-template.md "$tmp/profile.md"
cp kit/config/settings.example.yml "$tmp/settings.yml"
mkdir -p "$tmp/episodes" "$tmp/notes" "$tmp/raw/private"
echo "ok scaffolded"
```
Expected: prints `ok scaffolded`.

- [ ] **Step 2: Point the MCP lib at the temp repo and verify private guard**

Run:
```bash
cd mcp && npm run build && PERSONAL_BACKGROUND_DIR="$tmp" node -e "import('./dist/lib.js').then(m=>{const r=m.createRepo(process.env.PERSONAL_BACKGROUND_DIR);r.addEntry('episodes','2026-07-04-x.md','launched project X');console.log('search:',JSON.stringify(r.searchBackground('project X')));console.log('private:',r.isPrivatePath('raw/private/x.md'));})"
```
Expected: search returns the episode hit; `private: true`; no `raw/private` in results.

- [ ] **Step 3: Verify all skills have valid frontmatter**

Run:
```bash
for f in kit/skills/*/SKILL.md; do echo "== $f =="; head -5 "$f"; done
```
Expected: each shows `name:`, `description:`, `user-invocable: true`.

- [ ] **Step 4: Clean up temp dir**

Run: `rm -rf "$tmp" && echo cleaned`
Expected: `cleaned`.

- [ ] **Step 5: Final commit (if any doc tweaks were needed)**

```bash
git add -A && git commit -m "test: end-to-end bootstrap + mcp dry-run verified" || echo "nothing to commit"
```

---

## Self-Review Notes (for the implementer)

- Every spec section maps to a task: kit layout (T1-3), skills incl. localize/import/upgrade (T4-8), MCP bridge (T9-10), bootstrap (T11), docs (T12), verification (T13), file ownership contract (global constraints + T7/T12), language handling (global + T4/T5/T11), RAG/graph seam (settings `index.enabled` + `search_background` in T1/T9), extension conventions (import skill T6).
- Types are consistent: `createRepo`/`Repo` interface defined in T9 is consumed unchanged in T10.
- No placeholders: all new markdown and code is provided in full; migrations of existing skills specify exact copy + the exact rule block to insert.
