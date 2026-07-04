---
name: setup-agent
description: Generate agent-specific adapter files from the unified personal background core. Use when the user says "generate my claude setup", "setup codex", "create cursor rules from my profile", "migrate to X agent", or asks to configure any AI agent to read this repo.
user-invocable: true
---

# Setup Agent Skill

Generate agent-specific adapter files from the unified personal background core. This skill is AI-driven: it reads the user's actual profile, preferences, and constraints, researches the target agent's instruction-file format, and writes a tailored adapter file.

## When to use

- User says "setup my claude config"
- User says "generate codex instructions"
- User says "create cursor rules from my profile"
- User says "migrate to X agent"
- User names any AI agent (e.g., "configure this for Windsurf", "make it work with Gemini CLI")
- User asks to generate agent-specific files from the personal background repo

## What to read first

1. `profile.md`
2. `preferences.md`
3. `constraints.md`
4. Recent `episodes/*.md` (last 5-10)
5. Recent `notes/*.md` (last 5-10)

## Workflow

1. Ask the user which agent(s) to set up, or infer from their request.
2. Read the unified core files and recent episodes/notes.
3. For each target agent, research the correct instruction-file format and conventions:
   - Use web search or FetchUrl if the format is not already known.
   - Find the official filename, location, and any YAML frontmatter or special syntax.
4. Generate a concise, tailored instruction file for that agent:
   - Summarize who the user is (identity, goals, skills)
   - List key decision preferences and communication style
   - List hard constraints that must be respected
   - Reference `episodes/` and `notes/` for recent context
   - Include privacy boundaries (e.g., never upload `raw/private/`)
   - Follow the agent's own filename and syntax conventions
5. Present the proposed file(s) to the user before writing.
6. Wait for explicit confirmation.
7. Write the files.
8. Report what was created.

## Common agent mappings

Use these as defaults, but always verify with the latest docs if the user asks for a specific agent:

- **claude** → `CLAUDE.md` (imports `AGENTS.md` with `@AGENTS.md`)
- **codex** → `AGENTS.md` (plain markdown, cross-tool standard)
- **cursor** → `.cursorrules` or `.cursor/rules/*.mdc`
- **copilot** → `.github/copilot-instructions.md`
- **gemini** → `GEMINI.md`
- **windsurf** → `.windsurfrules` or `AGENTS.md`
- **aider** → `.aider.conf.yml` or `AGENTS.md`

## Research rules

- If the agent is not in the common mappings, search for its official docs: e.g., "<agent name> instruction file format" or "<agent name> rules file".
- Prefer the official filename/location from the agent's documentation.
- Do not invent unsupported syntax. If the format is unknown, ask the user for the target filename and any known conventions.

## Important

This is not a template replacement. Use the AI's reasoning to summarize and adapt the user's actual content, and use the agent's real documentation to get the format right. Do not just copy-paste `profile.md` into the agent file; extract the high-signal rules that agent should follow.
