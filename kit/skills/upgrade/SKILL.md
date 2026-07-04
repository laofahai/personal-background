---
name: upgrade
description: Apply upstream kit updates into the user's repo via a reasoned merge, never a blind overwrite. Use when the user says "upgrade my personal-background", "pull the latest kit", "update the framework", or asks to get new skills/templates from upstream.
user-invocable: true
---

# Upgrade Skill

The repo is both a kit and the user's data home. A plain `git pull` would entangle upstream changes with user data and customizations. This skill performs a consent-gated, reasoned merge of framework-owned files only.

## Absolute rules

- **User consent is mandatory.** Upgrades are user-initiated (never automatic). Nothing is written until the user explicitly approves the merge plan.
- **Only framework-owned paths may change:** `kit/`, `mcp/`, `methodology.md`, `bootstrap/`, `README.md`, `README.zh.md`, `docs/`, `LICENSE`.
- **Never touch user-owned paths:** `AGENTS.md`, `profile.md`, `preferences.md`, `constraints.md`, `episodes/`, `notes/`, `raw/`, `archive/`, `index/`.
- **Exception for `.pbg/settings.yml`:** during an approved upgrade, the skill may write only the `kit_version` field into `.pbg/settings.yml` (no other user-owned fields).

## Repo path

- Operate on the repo at `.pbg/settings.yml` `repo_path`. If absent, ask the user.

## Workflow

1. Determine the upstream source: prefer a git remote named `upstream`; if absent, ask the user for the upstream repo URL and add it (`git remote add upstream <url>`).
2. Fetch upstream without merging: `git fetch upstream`.
3. Read installed version (`.pbg/settings.yml` `kit_version`) and upstream version (`upstream/main:kit/manifest.yml` `kit_version`). If equal, report "already up to date" and stop.
4. Compute the changed framework-owned files between installed state and upstream (e.g. `git diff --name-only HEAD upstream/main -- kit/ mcp/ methodology.md bootstrap/ README.md README.zh.md docs/ LICENSE`).
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
