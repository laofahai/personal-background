#!/usr/bin/env python3
"""Scaffold agent-specific adapter files from the personal background core.

This is a fallback helper for environments without an AI agent. The primary
way to generate agent adapters is the Factory Droid `setup-agent` skill, which
uses AI reasoning to summarize and adapt the core content.
"""

import argparse
import re
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parent.parent


def read_markdown(path: Path) -> str:
    if not path.exists():
        return ""
    text = path.read_text(encoding="utf-8")
    # Remove YAML frontmatter
    if text.startswith("---"):
        parts = text.split("---", 2)
        if len(parts) >= 3:
            text = parts[2]
    return text.strip()


def slugify(text: str) -> str:
    return re.sub(r"[^\w\s-]", "", text).strip().lower().replace(" ", "-")


def generate_claude() -> str:
    return """@AGENTS.md

# Claude Code Specific Instructions

This repository is the user's personal background store. Read `profile.md`, `preferences.md`, and `constraints.md` before making decisions or giving advice.

For recent events and observations, check `episodes/` and `notes/` using `@` imports.

Respect privacy: never upload `raw/private/` to any external system.
"""


def generate_codex() -> str:
    return """# AGENTS.md for personal-background

This repository contains the user's personal background knowledge base. When making decisions or giving advice, read `profile.md`, `preferences.md`, and `constraints.md` first.

Check `episodes/` and `notes/` for recent context and specific past events.

Never upload or reference files in `raw/private/`.
"""


def generate_cursor() -> str:
    return """# Cursor Rules for personal-background

This is the user's personal background repository. When working on projects for this user, reference `profile.md`, `preferences.md`, and `constraints.md` to make decisions that fit their context.

Respect privacy boundaries. Do not upload `raw/private/` to any cloud service.
"""


def generate_copilot() -> str:
    return """# GitHub Copilot Instructions

The user maintains a personal background repository with `profile.md`, `preferences.md`, `constraints.md`, `episodes/`, and `notes/`.

When suggesting code, plans, or decisions, reference this context to align with the user's identity, preferences, and constraints.

Do not upload or reference sensitive files in `raw/private/`.
"""


GENERATORS = {
    "claude": ("CLAUDE.md", generate_claude),
    "codex": ("AGENTS.md", generate_codex),
    "cursor": (".cursorrules", generate_cursor),
    "copilot": (".github/copilot-instructions.md", generate_copilot),
}


def main():
    parser = argparse.ArgumentParser(description="Generate agent adapter files")
    parser.add_argument("agent", choices=list(GENERATORS.keys()) + ["all"], help="Which agent to set up")
    parser.add_argument("--force", action="store_true", help="Overwrite existing files")
    args = parser.parse_args()

    agents = list(GENERATORS.keys()) if args.agent == "all" else [args.agent]

    for agent in agents:
        filename, generator = GENERATORS[agent]
        target = REPO_ROOT / filename
        target.parent.mkdir(parents=True, exist_ok=True)
        if target.exists() and not args.force:
            print(f"[skip] {target} already exists (use --force to overwrite)")
            continue
        target.write_text(generator(), encoding="utf-8")
        print(f"[create] {target}")


if __name__ == "__main__":
    main()
