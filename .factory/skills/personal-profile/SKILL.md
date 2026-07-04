---
name: personal-profile
description: Initialize or update the user's personal background. Use when the user says "update my background", "remember this", "record this experience", "log this", or asks to change their profile/preferences/constraints.
user-invocable: true
---

# Personal Profile Skill

Maintain the user's personal background repository. This is a unified, local-first, markdown-based knowledge base.

## When to use

- User says "update my background"
- User says "remember this" / "log this" / "record this experience"
- User shares a fact about themselves that should persist across sessions
- User asks to change their profile, preferences, or constraints

## What to read first

Read the current state before making changes:

1. `profile.md`
2. `preferences.md`
3. `constraints.md`
4. Recent `episodes/*.md` (last 10 files by filename)
5. Recent `notes/*.md` (last 10 files by filename)

## Decision rules

Decide where new information belongs:

- **Stable identity fact** (education, work, skills, goals, projects) → update `profile.md`
- **Decision preference or value** (risk tolerance, communication style, heuristics) → update `preferences.md`
- **Hard constraint** (budget, time, geography, family, health, legal) → update `constraints.md`
- **Specific event or choice with a date** → create `episodes/YYYY-MM-DD-slug.md`
- **Observation, insight, or pattern** → create `notes/YYYY-MM-DD-slug.md`

## Workflow

1. Acknowledge what the user wants to capture or update.
2. Read the existing files.
3. Decide the target file(s) based on the rules above.
4. Present a concise plan to the user:
   - What will be changed
   - Which file(s) will be created or modified
   - Why this placement makes sense
5. Wait for explicit confirmation before writing.
6. Apply the changes, preserving existing structure and updating `last_updated` frontmatter on modified core files.
7. Verify the file was written and report the result.

## Writing rules

- Keep `profile.md`, `preferences.md`, and `constraints.md` concise. They are pre-loaded context; every line competes for attention.
- Put detailed narrative in `episodes/` or `notes/`.
- Use YAML frontmatter on all new files.
- For filenames, use `YYYY-MM-DD-slug.md` with lowercase, hyphenated ASCII slugs. Avoid Chinese or special characters in filenames.
- Match the user's primary language. If the existing core files are in Chinese, write new content in Chinese; if English, write in English. Keep language consistent.
- Maintain objectivity: rephrase embellished claims into verifiable facts. Add `confidence: low/medium/high` for observations in notes.
- Never overwrite `raw/private/` or upload it anywhere.

## Example triggers

- "I just got a new job" → update `profile.md` Work section + create `episodes/YYYY-MM-DD-new-job.md`
- "I prefer short, direct answers" → update `preferences.md` Communication Style
- "I can't work on weekends" → update `constraints.md` Time section
- "Remember that I hate Slack" → create `notes/YYYY-MM-DD-hate-slack.md`
