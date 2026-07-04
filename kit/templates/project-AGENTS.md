---
# AGENTS.md for {{PROJECT_NAME}}

This project is linked to the user's personal background repository at `{{REPO_PATH}}`.
Read that background before making decisions that affect the user.

## Before making decisions in this project

Use the `personal-background` MCP server to read:

1. `read_profile` — stable identity (education, work, skills, goals, projects)
2. `read_preferences` — decision preferences and communication style
3. `read_constraints` — hard constraints (time, budget, geography, family, health, technology)

If the user's request references a recent event or specific observation, also scan recent `episodes/` and `notes/` with `list_recent` or `search_background`.

## How to update the background

When the user says things like:
- "remember this"
- "this matters to me"
- "I prefer..."
- "I can't..."
- "update my background"
- makes a significant decision or experiences a notable event

Use the MCP tools to write to the personal-background repo:
- Specific event with a date → `add_episode` (filename `YYYY-MM-DD-slug.md`)
- Preference, observation, or pattern → `add_note` (filename `YYYY-MM-DD-slug.md`)
- Stable fact about identity → update `profile.md` via the `personal-profile` or `complete-profile` skill

## Continuous capture habit

At the end of a substantial conversation, ask the user:
> "Is there anything from this conversation I should record in your personal-background?"

Only write if they confirm. Never guess or record sensitive details without consent.

## Privacy boundaries

- Never read or upload files from `{{REPO_PATH}}/raw/private/`.
- Do not share the user's personal context outside this project/session unless explicitly asked.
- When in doubt, ask before reading or writing personal background.
