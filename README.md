# Personal Background

A lightweight, local-first, markdown-based personal background management system.

## Quick Start

1. Clone this repo to `~/Documents/workspace/personal-background/`
2. Copy `templates/profile-template.md` to `profile.md` and fill it out
3. Install Factory Droid skills:
   - `.factory/skills/personal-profile/SKILL.md`
   - `.factory/skills/reflect/SKILL.md`
   - `.factory/skills/setup-agent/SKILL.md`
4. Reference files from this repo in other AI projects

## Core Philosophy

- **Local-first**: plain markdown + YAML frontmatter, no database or vector store required.
- **Privacy-friendly**: sensitive raw materials go to `raw/private/` and are gitignored by default.
- **Unified core**: one set of `profile.md` / `preferences.md` / `constraints.md` / `episodes/` / `notes/` as the source of truth.
- **Multi-agent adapters**: AI-driven adapters for Factory, Claude, and Codex; extensible for other agents.
- **AI as librarian**: humans provide raw material; AI organizes, indexes, and updates the wiki.

## Structure

```text
personal-background/
├── AGENTS.md                 # Cross-tool entry point (Codex native, Claude/Factory compatible)
├── CLAUDE.md                 # Claude adapter
├── methodology.md            # Personal background management methodology
│
├── profile.md                # Stable identity: education, work, skills, goals
├── preferences.md            # Decision preferences: risk, values, communication style
├── constraints.md            # Hard constraints: geography, budget, time, family
│
├── episodes/                 # Timestamped experiences
├── notes/                    # Free-form observations
├── raw/                      # Raw materials
│   ├── public/               # Resumes, certificates (safe for git)
│   └── private/              # Sensitive materials (gitignored by default)
│
├── templates/                # Templates for new users
│   ├── profile-template.md
│   ├── episode-template.md
│   └── note-template.md
│
├── archive/                  # Archive for outdated episodes/notes
│
├── .factory/
│   └── skills/               # Factory Droid skills (AI-driven)
│       ├── personal-profile/ # Initialize / update personal background
│       ├── reflect/          # Merge episodes/notes into core
│       └── setup-agent/      # Generate adapter files for other agents
│
├── scripts/                  # Helper scripts (work without AI)
│   ├── init.sh
│   ├── reflect.py
│   └── migrate-agent.py
│
├── hooks/                    # Optional: Claude Code Stop hook
│   └── claude-code-stop-extract.sh
│
└── mcp/                      # Optional: MCP wrapper for the unified core
    ├── package.json
    ├── tsconfig.json
    ├── src/server.ts
    └── README.md
```

## Three-Agent Adapters

### Factory Droid

Use skills:

- `/personal-profile`: initialize or update personal background
- `/reflect`: periodically merge episodes/notes into profile/preferences
- `/setup-agent`: generate adapter files for Claude / Codex / Cursor / Copilot

### Claude Code

Reads `CLAUDE.md` and `AGENTS.md`. When making decisions, Claude will read `profile.md`, `preferences.md`, and `constraints.md`.

### Codex CLI

Reads `AGENTS.md` natively. Unified core rules are shared through `AGENTS.md`.

## Sync & Backup

Recommended as a private GitHub repository:

```bash
git init
git remote add origin git@github.com:yourname/personal-background.git
git add .
git commit -m "init personal background"
git push -u origin main
```

Core files work fully offline. Git is only a sync layer. `raw/private/` is not tracked by git.

## Language

- Project files (`README.md`, `methodology.md`, skills, scripts) are in English.
- Your personal data files (`profile.md`, `preferences.md`, `constraints.md`, `episodes/`, `notes/`) can be in any language you prefer: Chinese, Spanish, Japanese, etc.
- Use ASCII slugs for filenames (`YYYY-MM-DD-short-slug.md`). The body can be in your preferred language.
- See `methodology.md` for language and objectivity best practices.

## Migration

- From `~/.factory/memories.md`: move personal entries to `notes/` or `episodes/`
- From `CLAUDE.local.md`: extract personal preferences into `preferences.md`
- From resume: copy to `raw/public/` and distill into `profile.md`
- From chat logs: manually distill into `episodes/` or `notes/`. Do not bulk-import.

## License

MIT

---

## 中文 / Chinese

### 快速开始

1. 将本仓库 clone 到 `~/Documents/workspace/personal-background/`
2. 复制 `templates/profile-template.md` 到 `profile.md` 并填写
3. 安装 Factory Droid 技能：
   - `.factory/skills/personal-profile/SKILL.md`
   - `.factory/skills/reflect/SKILL.md`
   - `.factory/skills/setup-agent/SKILL.md`
4. 在其他 AI 项目中引用本仓库文件路径

### 核心理念

- **本地优先**：纯 markdown + YAML frontmatter，不依赖数据库或向量存储。
- **隐私友好**：敏感原始资料放在 `raw/private/` 并默认 gitignore。
- **统一核心**：一套 `profile.md` / `preferences.md` / `constraints.md` / `episodes/` / `notes/` 作为事实来源。
- **多 Agent 适配**：为 Factory、Claude、Codex 提供 AI 驱动的适配器，其他 agent 可扩展。
- **AI 是图书管理员**：人提供原始资料，AI 负责整理、索引、更新 wiki。

### 三大 Agent 适配

- **Factory Droid**：使用 `/personal-profile`、`/reflect`、`/setup-agent` 技能。
- **Claude Code**：读取 `CLAUDE.md` 和 `AGENTS.md`，决策时读取核心文件。
- **Codex CLI**：原生读取 `AGENTS.md`。

### 语言

- 项目文件（README、methodology、skills、scripts）使用英文。
- 你的个人资料文件（profile、preferences、constraints、episodes、notes）可以使用你偏好的任何语言：中文、西班牙语、日语等。
- 文件名使用 ASCII slug（`YYYY-MM-DD-short-slug.md`），正文使用你的偏好语言。

### 许可证

MIT
