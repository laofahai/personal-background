#!/usr/bin/env bash
# Claude Code Stop hook: prompt user to reflect after a session ends.
#
# Install in ~/.claude/settings.json:
#
# {
#   "hooks": {
#     "Stop": [
#       {
#         "matcher": "",
#         "hooks": [
#           {
#             "type": "command",
#             "command": "bash /path/to/personal-background/hooks/claude-code-stop-extract.sh"
#           }
#         ]
#       }
#     ]
#   }
# }
#
# This hook reads session metadata from stdin and reminds the user to run
# /reflect if anything should be captured.

set -euo pipefail

read -r HOOK_INPUT

SESSION_ID=$(echo "$HOOK_INPUT" | python3 -c "import sys, json; print(json.load(sys.stdin).get('session_id', ''))" 2>/dev/null || true)
PROJECT_DIR=$(echo "$HOOK_INPUT" | python3 -c "import sys, json; print(json.load(sys.stdin).get('cwd', ''))" 2>/dev/null || true)

if [[ -n "$SESSION_ID" && -n "$PROJECT_DIR" ]]; then
  echo ""
  echo "[personal-background] Session ended. Anything to remember? Run /reflect or say 'update my background'."
  echo ""
fi
