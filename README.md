# Personal Background

A lightweight, local-first, markdown-based personal background management system. Helps AI agents understand who you are, how you make decisions, and what constraints you operate under.

[中文版本](README.zh.md)

## What This Solves

AI agents start every conversation with no memory. This leads to repeated questions, generic advice, and decisions that ignore your values and constraints. This repository stores your personal context in plain markdown so agents can make better decisions across projects.

## Quick Start

1. Clone this repo to a location of your choice.
2. Run `scripts/init.sh` or copy the templates to the root files.
3. Fill out `profile.md`, `preferences.md`, and `constraints.md`.
4. Tell your AI agent to read this repo when making decisions that affect you.

## Core Design

- **Local-first**: plain markdown + YAML frontmatter, no database or vector store required.
- **Privacy-friendly**: sensitive materials go to `raw/private/` and are gitignored by default.
- **Unified core**: `profile.md`, `preferences.md`, and `constraints.md` are the stable source of truth; `episodes/` and `notes/` capture events and observations.
- **AI-driven maintenance**: Factory Droid skills (`complete-profile`, `personal-profile`, `reflect`, `setup-agent`) help you create, update, consolidate, and port your background.
- **Cross-agent**: `AGENTS.md` and `CLAUDE.md` are read by Claude, Codex, and other compatible agents.

## Repository Structure

```text
personal-background/
├── AGENTS.md                 # Cross-tool entry point
├── CLAUDE.md                 # Claude-specific adapter
├── methodology.md            # Personal background management methodology
│
├── profile.md                # Stable identity
├── preferences.md            # Decision preferences
├── constraints.md            # Hard constraints
│
├── episodes/                 # Timestamped experiences
├── notes/                    # Free-form observations
├── raw/                      # Raw materials
│   ├── public/               # Safe for git
│   └── private/              # Gitignored by default
│
├── templates/                # Templates for new users
├── archive/                  # Archive for outdated entries
│
├── .factory/skills/          # Factory Droid skills
│   ├── complete-profile/     # Guided onboarding / profile completion
│   ├── personal-profile/     # Update personal background
│   ├── reflect/              # Merge episodes/notes into core
│   └── setup-agent/          # Generate adapter files for other agents
├── scripts/                  # Helper scripts
├── hooks/                    # Optional Claude Code hook
└── mcp/                      # Optional MCP server
```

## How Agents Use This

When an agent works with you, it should read:

- `profile.md` for stable identity
- `preferences.md` for decision style and values
- `constraints.md` for non-negotiable boundaries
- `episodes/` and `notes/` for recent context and specific events

## Sync & Backup

For cross-device access, use a private GitHub repository. Core files work fully offline; git is only a sync layer.

## Language

- Project files (`README.md`, `methodology.md`, skills, scripts) are in English.
- Your personal data files (`profile.md`, `preferences.md`, `constraints.md`, `episodes/`, `notes/`) can be in any language you prefer.
- Use ASCII slugs for filenames (`YYYY-MM-DD-short-slug.md`). The body can be in your preferred language.

## License

MIT
