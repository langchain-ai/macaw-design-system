#!/usr/bin/env bash
# Load the canonical contributor skill at session and subagent startup.
set -euo pipefail

repo_root="$(cd -- "${BASH_SOURCE[0]%/*}/../.." && pwd)"

jq -n --arg event "$1" \
  --arg source "$repo_root/.agents/skills/design-system/SKILL.md" \
  --rawfile context "$repo_root/.agents/skills/design-system/SKILL.md" '{
    hookSpecificOutput: {
      hookEventName: $event,
      additionalContext: ("Macaw contributor guidance from " + $source + ". Follow this skill for design-system work. Resolve relative references from the skill file.\n\n" + $context)
    }
  }'
