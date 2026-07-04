# Personal Background

A local-first, markdown-based personal background kit and data home. It gives AI agents persistent context about who you are, how you make decisions, and what boundaries you operate under, without locking your data into any tool.

[中文版本](README.zh.md)

## Quick Start

1. Clone this repo to a location of your choice.
2. Open the repo in your AI agent and paste the entire contents of [`bootstrap/PROMPT.md`](bootstrap/PROMPT.md).
3. The agent will scaffold your data files, install the skills, and register the MCP server.
4. Start using `complete-profile` for guided onboarding, or just say "remember this" to capture an episode or note.

## Repository Structure

```text
personal-background/
├── kit/                    # Framework: manifest, templates, skills
│   ├── manifest.yml
│   ├── config/settings.example.yml
│   ├── templates/          # Data file templates
│   └── skills/             # Installable skills for agents
├── bootstrap/              # The canonical bootstrap prompt
├── mcp/                    # First-class MCP server (runs TS directly via bun)
│
├── AGENTS.md               # Cross-agent entry point
├── methodology.md          # Background management methodology
├── README.md / README.zh.md
├── LICENSE
│
├── profile.md              # Stable identity (user-owned)
├── preferences.md          # Decision preferences (user-owned)
├── constraints.md          # Hard constraints (user-owned)
├── episodes/               # Timestamped experiences (user-owned)
├── notes/                  # Free-form observations (user-owned)
├── raw/                    # Raw materials
│   ├── public/             # Safe for git
│   └── private/            # Gitignored; never read by the MCP server
├── archive/                # Outdated entries
└── .pbg/                   # Gitignored runtime config (created by bootstrap)
```

## File Ownership Contract

Framework-owned files (read and updated by the kit, never by the user's personal data):

- `kit/`, `bootstrap/`, `mcp/`
- `AGENTS.md`, `README.md`, `README.zh.md`, `methodology.md`, `docs/`, `LICENSE`

User-owned files (never overwritten by any tool unless you explicitly approve):

- `profile.md`, `preferences.md`, `constraints.md`
- `episodes/`, `notes/`, `raw/`, `archive/`
- `.pbg/`, `index/`

The `upgrade` skill respects this boundary and only touches framework-owned paths.

## Two Access Surfaces

1. **MCP bridge** (`mcp/`) for daily cross-project use: read and write background from any project that speaks MCP. The server reads the repo path from `PERSONAL_BACKGROUND_DIR` and never reads `raw/private/`.
2. **Skills** (`kit/skills/`) for guided maintenance: `personal-profile`, `complete-profile`, `reflect`, `setup-agent`, `localize`, `import`, and `upgrade`. The bootstrap prompt installs these into your agent.

## Language

- Framework files are in English and are the canonical source.
- User data is written in the `preferred_language` stored in `.pbg/settings.yml`.
- Use the `localize` skill to produce translated copies of framework docs (e.g. `README.zh.md`) or, with your explicit confirmation, to convert your user data to another language.
- Filenames stay ASCII (`YYYY-MM-DD-short-slug.md`); the body can be in your preferred language.

## Sync & Backup

Use a private git repository or any markdown-compatible sync. The core design is local-first; git is just a sync layer.

## Upgrade

Never run a blind `git pull` over your data. Use the `upgrade` skill to apply upstream kit changes with a consent-gated, reasoned merge of framework-owned files only.

## License

MIT
