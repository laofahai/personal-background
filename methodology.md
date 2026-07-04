# Personal Background Management Methodology

## Why Personal Background Management

AI agents start every conversation from scratch. Without persistent, structured personal context, agents repeat the same questions, make the same mistakes, and give advice that does not match your values and constraints.

## Core Concepts

### Stable Identity (`profile.md`)

Facts that are long-term or change slowly: education, work, skills, languages, goals, projects. This is the foundation for an agent to understand who you are. Maps to Mem0's **User memory**.

### Decision Preferences (`preferences.md`)

Subjective tendencies that influence choices: risk tolerance, values, communication style, decision heuristics, learning preferences. This is key for agents to give advice that fits you. Maps to Mem0's **User memory**.

### Hard Constraints (`constraints.md`)

Non-negotiable boundaries: geography, budget, time, family, health, legal, technology stack limits. Agents must read these before any plan. Maps to Mem0's **User memory**.

### Timestamped Experiences (`episodes/`)

Specific events: changing jobs, launching projects, making important choices, experiencing failures. Each episode has a date, type, impact, and reflection. They answer "what happened" and "why". Maps to **Episodic memory**.

### Free Observations (`notes/`)

Preferences or insights distilled from conversations: "I don't like being rushed", "I care deeply about data privacy", "I prefer writing tests first". They answer "what did I notice". Maps to **Semantic memory**.

## Workflow: Capture → Distill → Reflect → Apply

### 1. Capture

When something worth remembering appears in a conversation, record it immediately:

- Specific event → write to `episodes/`
- Preference or observation → write to `notes/`
- Important fact → update `profile.md`

Trigger phrases:
- "remember this"
- "record this experience"
- "this matters to me"
- "update my background"
- "reflect"

### 2. Distill

Do not save the whole conversation verbatim. Extract:

- What is the fact?
- What is the impact on the user?
- What is the implication for future decisions?

### 3. Reflect

Run reflect periodically (recommended weekly):

- Scan `episodes/` and `notes/` for recurring themes
- Merge repeated patterns into `profile.md` or `preferences.md`
- Mark processed files with `processed: true` or move them to `archive/`

### 4. Apply

Reference this repository in other AI projects:

- Factory Droid: read through skills
- Claude Code: read through `CLAUDE.md` / `AGENTS.md`
- Codex CLI: read through `AGENTS.md`

## Writing Conventions

### Episodes

Filename: `YYYY-MM-DD-slug.md`

```yaml
---
date: 2026-07-04
type: project|choice|turning|failure|success|milestone
tags: [career, ai, decision]
impact: high|medium|low
processed: false
---
```

Body structure:
- Context
- Event
- Decision
- Outcome
- Reflection

### Notes

Filename: `YYYY-MM-DD-slug.md`

```yaml
---
date: 2026-07-04
category: preference|observation|insight|pattern
source: conversation|reading|experience
confidence: high|medium|low
processed: false
---
```

Body structure:
- Observation
- Evidence
- Implication

## Privacy & Security

1. `raw/private/` is not tracked by git by default.
2. Truly sensitive information (ID numbers, medical records, home addresses) should not be placed on any internet-connected device, including private repositories.
3. If you must store sensitive materials in the cloud, encrypt them with age or git-crypt.
4. Cross-device sync is recommended via a private GitHub repository, but the core design remains local-first.

## Migration

When migrating from other systems:

- `~/.factory/memories.md` → split into `notes/` and `episodes/`
- `CLAUDE.local.md` → extract personal preferences into `preferences.md`
- Resume → put in `raw/public/` and distill into `profile.md`
- Chat logs → manually distill into `episodes/` or `notes/`. Do not bulk-import.

## Language & Objectivity

### Language Choice

- Project files (`README.md`, `methodology.md`, skills, scripts) are in English.
- Your personal data files (`profile.md`, `preferences.md`, `constraints.md`, `episodes/`, `notes/`) can be in any language you prefer. Keep the same language within each file for consistency.
- Use ASCII slugs for filenames (`YYYY-MM-DD-short-slug.md`). The body can be in your preferred language.

### Stay Objective

Users tend to embellish or exaggerate their experiences. When maintaining the repository, the agent should help ground statements in facts:

- Turn evaluative language into verifiable facts:
  - ❌ "I am a great leader"
  - ✅ "Led teams of 5-8 people for 3 years and shipped 3 products"
- Distinguish facts from self-assessments:
  - Fact: "Joined company B from company A in 2025, promoted from Senior to Staff"
  - Self-assessment: "I think I am good at system design" (keep, but label as self-assessment)
- Require evidence: include the basis in the Evidence section of `notes/`.
- Use confidence markers: use `confidence: low` or `confidence: medium` for uncertain observations.
- Check during reflection: has the same event been exaggerated across different episodes? If so, merge into a more objective version.

## Anti-Patterns

- Don't write novels: keep each episode/note to 300-800 words.
- Don't over-structure: don't create a separate file for every field; keep markdown readable.
- Don't hoard: archive outdated content regularly to avoid noise drowning signal.
- Don't over-automate: build manual habits first, then gradually add automation.
- Don't put everything in one file: use layers to keep signals high.
- Don't embellish: avoid unsupported adjectives; use verifiable facts and numbers.

## Tooling & Ownership

### Access surfaces

Two interfaces read and write the same markdown data home:

1. **MCP bridge** (`mcp/`) — for daily cross-project use. Any MCP client can read core files, search the background, and add episodes or notes. The server reads the repo path from `PERSONAL_BACKGROUND_DIR` and never reads `raw/private/`.
2. **Skills** (`kit/skills/`) — for guided maintenance. They are installed by the bootstrap prompt and handle tasks like completing the profile, reflecting on notes, importing external markdown, localizing, and upgrading the kit. Skills read the repo path from `.pbg/settings.yml` and write user data in `preferred_language`.

Markdown is the only source of truth; both surfaces are views over it.

### Upgrades

The repo is both a kit and a data home. Framework-owned files (`kit/`, `bootstrap/`, `mcp/`, `README.md`, `methodology.md`, `docs/`, `LICENSE`) can be updated from upstream, but user-owned files (`AGENTS.md`, `profile.md`, `preferences.md`, `constraints.md`, `episodes/`, `notes/`, `raw/`, `archive/`, `.pbg/`, `index/`) must never be overwritten automatically. Use the `upgrade` skill for a consent-gated, reasoned merge of framework-owned files only.
