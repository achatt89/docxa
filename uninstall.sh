#!/usr/bin/env bash
set -euo pipefail

SKILL_DIR="${HOME}/.claude/skills/docxa"

if [ -d "${SKILL_DIR}" ]; then
    rm -rf "${SKILL_DIR}"
    echo "✓ Docxa skill removed from ${SKILL_DIR}"
else
    echo "ℹ Docxa skill is not installed at ${SKILL_DIR}"
fi
