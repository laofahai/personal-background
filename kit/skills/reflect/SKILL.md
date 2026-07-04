---
name: reflect
description: Periodically merge recurring patterns from episodes/notes into profile.md and preferences.md. Use when the user says "reflect", "consolidate my background", "merge my notes into profile", or when episodes/notes have accumulated.
user-invocable: true
---

# Reflect Skill

## Repo & language

- Operate on the repo whose absolute path is in `.pbg/settings.yml` under `repo_path`. If that file is absent (skill run standalone), ask the user for the repo path before writing.
- Write all user data in the `preferred_language` from `.pbg/settings.yml`. Keep each file internally consistent in one language.
- Never read or write `raw/private/`.

## When to use

- User says "reflect" or "consolidate my background"
- User says "merge my notes into profile"
- There are many unprocessed `episodes/` or `notes/` files
- The user asks for a summary of what has changed about them

## What to read

1. `profile.md`
2. `preferences.md`
3. `constraints.md`
4. All `episodes/*.md` with `processed: false` (or all recent ones if no frontmatter flag exists)
5. All `notes/*.md` with `processed: false` (or all recent ones if no frontmatter flag exists)

## Workflow

1. Scan all unprocessed episodes and notes.
2. Group them by theme and identify recurring patterns:
   - New preferences that appear multiple times
   - New constraints that have emerged
   - Changes to identity (new job, new skill, new goal)
   - Shifts in values or risk tolerance
3. Propose a consolidation plan to the user:
   - Which core files will be updated
   - What new content will be added
   - Which episodes/notes will be marked as processed
4. Wait for explicit confirmation.
5. Update core files, preserving structure and updating `last_updated`.
6. Mark processed episodes/notes by setting `processed: true` in their frontmatter.
7. Report what was changed.

## What to merge vs. what to keep as episode/note

- **Merge into core** if the pattern is stable, recurring, and affects future decisions.
- **Keep as episode/note** if it is a one-time event, a raw observation, or requires more context.
- **Do not merge** transient emotions, one-off complaints, or things likely to change within weeks.

## Reflection prompts

For each theme, ask:

- Is this a stable fact or a temporary state?
- Does this affect multiple future decisions?
- Has it appeared at least twice in recent episodes/notes?
- Can it be expressed as a concise preference, constraint, or identity item?
- Is the claim objective and verifiable? If not, rephrase it into facts or mark it as a self-assessment.
- Are there contradictory entries about the same topic? If so, surface the conflict to the user instead of merging blindly.

## Writing rules

- Keep core files high-signal and concise.
- Use bullets, not paragraphs, in core files.
- Put detailed reasoning in the original episode/note and reference it if needed.
- Update `last_updated` frontmatter on any modified core file.
