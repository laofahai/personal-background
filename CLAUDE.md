@AGENTS.md

# Claude Code Specific Instructions

This repository is the user's personal background store. It is not a regular project. Treat it as a source of truth about the user.

## When to read personal context

- Before giving advice, making plans, or decisions, read `profile.md`, `preferences.md`, and `constraints.md`.
- When the user mentions a recent project, change, or experience, check `episodes/` and `notes/`.
- If the user says "update my background", "remember this", "log this", or "reflect", use the corresponding skills or workflows.

## How to write and update

- Prefer concise, structured markdown with YAML frontmatter.
- For new experiences, create files in `episodes/` with the naming pattern `YYYY-MM-DD-slug.md`.
- For observations, create files in `notes/` with the naming pattern `YYYY-MM-DD-slug.md`.
- When updating `profile.md` or `preferences.md`, preserve the existing structure and update the `last_updated` frontmatter field.
- Keep `raw/private/` out of any cloud upload or external reference.

## Imports

Use `@` imports to read specific files when needed. For example:
- `@profile.md`
- `@preferences.md`
- `@episodes/2026-07-04-example-project-launch.md`
