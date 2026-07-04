---
name: setup-agent
description: Generate agent-specific adapter files from the unified personal background core. Use when the user says "generate my claude setup", "setup codex", "create cursor rules from my profile", or "migrate to X agent".
user-invocable: true
---

# Setup Agent Skill

Generate agent-specific adapter files from the unified personal background core. This skill is AI-driven: it reads the user's actual profile, preferences, and constraints, then writes tailored instructions for the target agent.

## When to use

- User says "setup my claude config"
- User says "generate codex instructions"
- User says "create cursor rules from my profile"
- User says "migrate to X agent"
- User asks to generate agent-specific files from the personal background repo

## What to read

1. `profile.md`
2. `preferences.md`
3. `constraints.md`
4. Recent `episodes/*.md` (last 5-10)
5. Recent `notes/*.md` (last 5-10)

## Supported agents

- **claude** → writes/updates `CLAUDE.md`
- **codex** → writes/updates `AGENTS.md`
- **cursor** → writes/updates `.cursorrules`
- **copilot** → writes/updates `.github/copilot-instructions.md`
- **all** → generates all of the above

## Workflow

1. Ask the user which agent(s) to set up, or infer from their request.
2. Read the unified core files and recent episodes/notes.
3. For each target agent, generate a concise, tailored instruction file:
   - Summarize who the user is (identity, goals, skills)
   - List key decision preferences and communication style
   - List hard constraints that must be respected
   - Reference `episodes/` and `notes/` for recent context
   - Include privacy boundaries (e.g., never upload `raw/private/`)
4. Present the proposed files to the user before writing.
5. Wait for explicit confirmation.
6. Write the files.
7. Report what was created.

## Agent-specific rules

### Claude (`CLAUDE.md`)

- Import `AGENTS.md` with `@AGENTS.md` at the top.
- Add Claude-specific instructions: read core files before decisions, use `@` imports for episodes/notes, respect privacy boundaries.

### Codex (`AGENTS.md`)

- Write plain markdown, no tool-specific syntax.
- Focus on cross-agent shared rules: stack, conventions, boundaries, and how to read the personal background core.

### Cursor (`.cursorrules`)

- Cursor supports `.cursorrules` as legacy format. Keep it concise.
- Include personal communication style and constraints.

### Copilot (`.github/copilot-instructions.md`)

- Write standard markdown instructions.
- Mention that the user has a personal background repo wherever they cloned it, and Copilot should reference it when relevant.

## Important

This is not a template replacement. Use the AI's reasoning to summarize and adapt the user's actual content. Do not just copy-paste `profile.md` into the agent file; extract the high-signal rules that agent should follow.
