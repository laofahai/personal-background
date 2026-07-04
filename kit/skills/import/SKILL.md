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
