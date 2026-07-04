---
name: localize
description: Localize the project docs into the user's preferred language, or convert the user's own data between languages. Use when the user says "translate my background", "localize the docs", "生成中文文档", or asks to change the language of any file here.
user-invocable: true
---

# Localize Skill

Produce preferred-language versions of content in the personal-background repo. The English framework files remain the canonical source; localized project docs are copies.

## Repo & language

- Operate on the repo whose absolute path is in `.pbg/settings.yml` under `repo_path`. If absent, ask the user.
- Read `preferred_language` from `.pbg/settings.yml` as the default target language; the user may override per request.
- Never touch `raw/private/`.

## Two modes

1. **Localize project docs (copies):** translate framework docs (e.g. `README.md`, `methodology.md`, a `SKILL.md` description) into the target language, writing to a sibling file with a language suffix (e.g. `README.zh.md`). Never edit the English source.
2. **Convert user data (in place, with consent):** translate user-owned files (`profile.md`, `preferences.md`, `constraints.md`, `episodes/*`, `notes/*`) into the target language. Present a plan and get explicit confirmation before writing, because this rewrites user-owned files.

## Workflow

1. Determine mode (project docs vs user data) and target language.
2. List the files that will be produced or changed.
3. For user-data conversion, show a diff/summary and wait for explicit confirmation.
4. Write localized files. For project docs use the `.<lang>.md` suffix; for user data update in place and set `last_updated` where the file has it.
5. Report what was created or changed.

## Rules

- Preserve YAML frontmatter keys; translate only human-readable values where appropriate.
- Keep filenames ASCII (`README.zh.md` is fine; do not create non-ASCII filenames).
- Do not invent facts during translation; keep meaning faithful.
