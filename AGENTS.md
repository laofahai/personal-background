# AGENTS.md for personal-background

This repository is **AI-first**: it is designed to be read, maintained, and updated primarily through AI agents, not by hand-editing files. Any AI agent that reads this file should know how to use the personal context stored here.

## What is this repository?

This is the user's personal background knowledge base. It is meant to be referenced by AI agents across projects to make better decisions, avoid repeated questions, and maintain continuity. Users interact with it through skills (guided workflows) and the MCP server (daily cross-project bridge); direct file editing is optional.

## Core files

Read these files when making decisions that affect the user:

- `profile.md` — stable identity: education, work, skills, goals, projects
- `preferences.md` — decision preferences: risk tolerance, values, communication style
- `constraints.md` — hard constraints: geography, budget, time, family, health, technology
- `episodes/` — timestamped experiences: projects, choices, turning points
- `notes/` — unstructured observations: preferences distilled from conversations

## How to use this context

- When the user asks for advice, a plan, or a decision, read `profile.md`, `preferences.md`, and `constraints.md` first.
- For recent context or specific past events, scan `episodes/` and `notes/`.
- Use file paths and timestamps as relevance signals. Prefer recent episodes unless the user asks for historical context.
- If you notice a recurring pattern, suggest updating `profile.md` or `preferences.md` via the reflect workflow.
- Never upload files from `raw/private/` to any cloud or external system.

## How to update this repository

- Add new experiences to `episodes/` using the `YYYY-MM-DD-slug.md` format with YAML frontmatter.
- Add observations to `notes/` using the same naming convention.
- For significant updates to stable identity or preferences, use the `personal-profile` workflow.
- Periodically run the `reflect` workflow to merge recurring patterns from `episodes/` and `notes/` into `profile.md` and `preferences.md`.

## Access surfaces

- **Skills** live in `kit/skills/` and are installed by the bootstrap prompt. They are the guided, conversational interface for maintaining the repository: `personal-profile`, `complete-profile`, `reflect`, `setup-agent`, `localize`, `import`, and `upgrade`. Each skill reads the repo path from `.pbg/settings.yml` `repo_path` and writes user data in `preferred_language`.
- **MCP server** (`mcp/`) is the daily cross-project bridge. It reads the repo path from `PERSONAL_BACKGROUND_DIR` (falling back to `~/personal-background`) and never reads `raw/private/`. Use it for fast reads and writes from any MCP client.
- **Agent-specific adapters:** some agents (Cursor, Copilot, etc.) read their own instruction file instead of `AGENTS.md`. Use the `setup-agent` skill to generate the correct adapter file (e.g. `.cursorrules`, `.github/copilot-instructions.md`) from this repository.

## File ownership contract

Framework-owned files (the kit may update these):

- `kit/`, `bootstrap/`, `mcp/`
- `AGENTS.md`, `README.md`, `README.zh.md`, `methodology.md`, `docs/`, `LICENSE`

User-owned files (never overwrite unless explicitly asked):

- `profile.md`, `preferences.md`, `constraints.md`
- `episodes/`, `notes/`, `raw/`, `archive/`
- `.pbg/`, `index/`

## Privacy and boundaries

- `raw/private/` is gitignored and may contain sensitive documents. Do not reference them unless explicitly asked.
- Never read `raw/private/` through the MCP server.
- Do not commit unencrypted sensitive personal data.
- When in doubt, ask the user before writing or sharing personal context.
