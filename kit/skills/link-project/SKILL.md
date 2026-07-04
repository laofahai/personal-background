---
name: link-project
description: Link the current project to the user's personal-background so the agent reads it before making decisions and can write back. Use when the user says "link this project to my background", "setup this project", "make this agent know my background", or starts a new project.
user-invocable: true
---

# Link Project Skill

Connect any project to the user's personal-background. This makes the agent read the user's profile, preferences, and constraints before making decisions in that project, and encourages capturing things worth remembering.

## Repo & language

- Operate on the personal-background repo whose absolute path is in `.pbg/settings.yml` under `repo_path`. If absent, ask the user for it.
- Write all user data in the `preferred_language` from `.pbg/settings.yml`.
- Never read or write `raw/private/` in the personal-background repo.

## When to use

- User says "link this project to my background"
- User says "setup this project"
- User says "make this agent know my background"
- User starts a new project and wants it to use personal-background
- The current project does not have an `AGENTS.md` or agent-specific instructions

## What to read first

1. `profile.md`
2. `preferences.md`
3. `constraints.md`
4. Recent `episodes/*.md` and `notes/*.md` (last 5-10)

## Workflow

1. Confirm the target project path (default: current working directory). Ask if the user wants to link a different project.
2. Confirm the project name (infer from directory name if not provided).
3. Read the personal-background core files and recent episodes/notes to understand the user.
4. Generate a project-level `AGENTS.md` from `kit/templates/project-AGENTS.md`, filling in the project name and the personal-background repo path.
5. Ask the user if they also want agent-specific adapter files (e.g. `.cursorrules`, `.github/copilot-instructions.md`) for the agent they are currently using. If yes, run the `setup-agent` workflow for the current project.
6. Present the proposed files and wait for explicit confirmation before writing.
7. Write the files.
8. Report what was created and remind the user that the agent will now read their background when working in this project.

## Rules

- Only write to the target project, never to the personal-background repo itself (except through MCP tools if the user asks to record something).
- The project-level `AGENTS.md` should be concise: it tells the agent how to read and write the user's background, not duplicate the background content.
- If the target project already has an `AGENTS.md`, show a diff/merge plan instead of overwriting blindly.
- Do not record any sensitive information from the project into the personal-background repo without explicit consent.
