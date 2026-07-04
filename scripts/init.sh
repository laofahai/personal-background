#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_DIR"

echo "Initializing personal-background repository..."

# Copy templates to core files if they don't exist
copy_if_missing() {
  local src="$1"
  local dst="$2"
  if [[ -f "$dst" ]]; then
    echo "  [skip] $dst already exists"
  else
    cp "$src" "$dst"
    echo "  [create] $dst"
  fi
}

copy_if_missing "templates/profile-template.md" "profile.md"
copy_if_missing "templates/preferences-template.md" "preferences.md"
copy_if_missing "templates/constraints-template.md" "constraints.md"

# Create directories
mkdir -p "raw/public" "raw/private" "episodes" "notes" "archive"

# Initialize git if needed
if [[ ! -d ".git" ]]; then
  git init
  git add .
  git commit -m "init personal-background"
  echo "Git repository initialized."
else
  echo "Git repository already exists."
fi

echo ""
echo "Next steps:"
echo "1. Fill out profile.md, preferences.md, constraints.md"
echo "2. Install Factory Droid skills from .factory/skills/"
echo "3. Use /personal-profile, /reflect, and /setup-agent"
echo "4. Set up GitHub private repo for sync if desired"
