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
   - Install deps: `cd mcp && bun install` (no build step; bun runs the TS server directly)
   - Register with env `PERSONAL_BACKGROUND_DIR=<repo_path>` pointing to this repo, e.g.
     `droid mcp add personal-background --env PERSONAL_BACKGROUND_DIR=<repo_path> -- bun <repo_path>/mcp/src/server.ts`
   - Adapt the command to my actual agent if different.
6. Tell me I can now either run the `complete-profile` skill for guided onboarding, or
   just talk to you and say "remember this" to capture episodes/notes.

Rules:
- Framework-owned files (`kit/`, `methodology.md`, `bootstrap/`, `AGENTS.md`, `README.md`,
  `docs/`, `LICENSE`) are yours to install/read; user-owned files are never overwritten.
- Write my data in my preferred language. Never read or upload `raw/private/`.
- Show me a short plan before writing anything.
