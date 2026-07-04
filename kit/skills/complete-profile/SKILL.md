---
name: complete-profile
description: Guide the user through completing or updating their personal background files. Use when the user says "complete my profile", "help me fill out my background", "onboarding", "I need to update my profile", or when there are many empty sections in the core files.
user-invocable: true
---

# Complete Profile Skill

## Repo & language

- Operate on the repo whose absolute path is in `.pbg/settings.yml` under `repo_path`. If that file is absent (skill run standalone), ask the user for the repo path before writing.
- Write all user data in the `preferred_language` from `.pbg/settings.yml`. Keep each file internally consistent in one language.
- Never read or write `raw/private/`.

## When to use

- User says "complete my profile"
- User says "help me fill out my background"
- User says "onboarding"
- User says "I need to update my profile"
- User says "let's finish my background"
- There are many empty or placeholder sections in `profile.md`, `preferences.md`, or `constraints.md`

## What to read first

1. `profile.md`
2. `preferences.md`
3. `constraints.md`
4. Recent `episodes/*.md` and `notes/*.md` (last 10 files)

## Workflow

1. Identify empty or placeholder sections in the core files. Markers include `_to fill_`, blank bullets, or sections with only headers.
2. Pick one high-priority section to start with. Recommended order: Identity → Work → Goals → Preferences → Constraints.
3. Ask the user a focused, conversational question to fill that section.
4. If the user gives a detailed story or event, propose creating an `episodes/` file plus a concise summary in the core file.
5. If the user gives a preference or observation, propose updating `preferences.md` or creating a `notes/` file.
6. Present the proposed changes and wait for explicit confirmation before writing.
7. Update the file(s), preserving structure and updating `last_updated` on modified core files.
8. Report what changed and ask if the user wants to continue to the next section.

## Question strategy

- Ask one or two questions at a time, not a long questionnaire.
- Start with the most stable facts (identity, work, goals) before moving to preferences and constraints.
- If the user is unsure, offer a concrete example or skip and come back later.
- When the user shares something emotionally rich or event-based, suggest recording it as an episode rather than stuffing it into a core file.

## Writing rules

- Keep core file entries concise: 1-3 bullets per section, each bullet one sentence or less.
- Move detailed narratives to `episodes/` or `notes/`.
- Use the user's preferred language for the content they provide.
- Maintain objectivity: rephrase embellished claims into verifiable facts. Add `confidence: low/medium/high` for uncertain observations in notes.
- Update `last_updated` frontmatter when modifying core files.

## Example flow

User: "complete my profile"

Agent: "I see your Work section is empty. What's your current role and the one or two most important things you've worked on?"

User: "I'm a staff engineer at X, leading the platform team. We rebuilt the billing pipeline last year."

Agent: "I'll add a concise bullet to `profile.md` Work section and create an episode for the billing pipeline rebuild. Does that work?"

User: "yes"

Agent: "Done. Want to continue with Goals next?"
