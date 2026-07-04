#!/usr/bin/env python3
"""Local helper to scan episodes/notes and suggest reflection themes.

This script does not call any AI API. It is a lightweight scanner that helps
identify recurring tags, unprocessed items, and candidate themes for the
reflect skill.
"""

import argparse
import re
from collections import Counter, defaultdict
from datetime import datetime
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parent.parent
EPISODES_DIR = REPO_ROOT / "episodes"
NOTES_DIR = REPO_ROOT / "notes"


def parse_frontmatter(path: Path) -> dict:
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---"):
        return {}
    _, rest = text.split("---", 1)
    if "---" not in rest:
        return {}
    fm_text, _ = rest.split("---", 1)
    data = {}
    for line in fm_text.splitlines():
        if ":" in line:
            key, value = line.split(":", 1)
            data[key.strip()] = value.strip()
    return data


def list_items(directory: Path):
    if not directory.exists():
        return []
    items = []
    for path in sorted(directory.glob("*.md")):
        fm = parse_frontmatter(path)
        items.append({
            "path": path,
            "title": path.stem,
            "date": fm.get("date", "unknown"),
            "type": fm.get("type", fm.get("category", "unknown")),
            "tags": _parse_tags(fm.get("tags", "")),
            "processed": fm.get("processed", "false").lower() == "true",
        })
    return items


def _parse_tags(tags_str: str) -> list:
    tags_str = tags_str.strip()
    if not tags_str:
        return []
    # Handle [tag1, tag2] or tag1, tag2
    tags_str = tags_str.strip("[]")
    return [t.strip() for t in tags_str.split(",") if t.strip()]


def main():
    parser = argparse.ArgumentParser(description="Scan personal background for reflection themes")
    parser.add_argument("--unprocessed", action="store_true", help="Only show unprocessed items")
    args = parser.parse_args()

    episodes = list_items(EPISODES_DIR)
    notes = list_items(NOTES_DIR)

    print(f"Episodes: {len(episodes)}")
    print(f"Notes: {len(notes)}")

    all_tags = Counter()
    unprocessed = []
    for item in episodes + notes:
        all_tags.update(item["tags"])
        if not item["processed"]:
            unprocessed.append(item)

    print(f"\nUnprocessed items: {len(unprocessed)}")
    if args.unprocessed:
        for item in unprocessed:
            print(f"  - {item['path'].name} ({item['date']}) [{', '.join(item['tags'])}]")

    print("\nTop tags:")
    for tag, count in all_tags.most_common(10):
        print(f"  - {tag}: {count}")

    # Group unprocessed by tag
    tag_to_items = defaultdict(list)
    for item in unprocessed:
        for tag in item["tags"]:
            tag_to_items[tag].append(item)

    print("\nCandidate themes for reflection:")
    for tag, items in sorted(tag_to_items.items(), key=lambda x: -len(x[1])):
        if len(items) >= 2:
            print(f"\n  #{tag} ({len(items)} items):")
            for item in items[:5]:
                print(f"    - {item['path'].name}")


if __name__ == "__main__":
    main()
