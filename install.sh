#!/usr/bin/env bash
set -euo pipefail

# Docxa Installer
# Wraps everything in main() to prevent partial execution on network failure

main() {
    SKILL_DIR="${HOME}/.claude/skills/docxa"
    REPO_URL="https://github.com/achatt89/docxa"

    echo "════════════════════════════════════════"
    echo "║   Docxa - Installer                  ║"
    echo "║   Claude Code Documentation Skill    ║"
    echo "════════════════════════════════════════"
    echo ""

    # Check prerequisites
    command -v git >/dev/null 2>&1 || { echo "✗ Git is required but not installed."; exit 1; }
    echo "✓ Git detected"

    # Create skill directory
    mkdir -p "${SKILL_DIR}"

    # Clone to temp directory
    TEMP_DIR=$(mktemp -d)
    trap "rm -rf ${TEMP_DIR}" EXIT

    echo "↓ Downloading Docxa..."
    git clone --depth 1 "${REPO_URL}" "${TEMP_DIR}/docxa" 2>/dev/null

    # Copy skill file
    echo "→ Installing skill files..."
    cp "${TEMP_DIR}/docxa/skill/SKILL.md" "${SKILL_DIR}/SKILL.md"

    echo ""
    echo "✓ Docxa skill installed successfully!"
    echo ""
    echo "  Installed:"
    echo "    • 1 skill file (~/.claude/skills/docxa/SKILL.md)"
    echo ""
    echo "Usage:"
    echo "  1. Start Claude Code:  claude"
    echo "  2. Run:                /docxa"
    echo "                         /docxa generate prd"
    echo "                         /docxa interview"
    echo "                         /docxa discover"
    echo ""
    echo "To uninstall: curl -fsSL ${REPO_URL}/raw/main/uninstall.sh | bash"
}

main "$@"
