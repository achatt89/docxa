# Installation

Docxa runs as a **Claude Code skill** (no Node.js required) or as a standalone **CLI** via npm.

## Option 1: Claude Code Skill (Recommended)

Install Docxa directly into Claude Code with a single command. No Node.js or npm required.

**macOS / Linux:**
```bash
curl -fsSL https://raw.githubusercontent.com/achatt89/docxa/main/install.sh | bash
```

**Windows (PowerShell):**
```powershell
irm https://raw.githubusercontent.com/achatt89/docxa/main/install.ps1 | iex
```

**Manual install:**
```bash
git clone https://github.com/achatt89/docxa.git
cd docxa
./install.sh        # macOS/Linux
.\install.ps1       # Windows
```

After installing, reload Claude Code. Docxa is available immediately as `/docxa`.

**To uninstall:**
```bash
curl -fsSL https://raw.githubusercontent.com/achatt89/docxa/main/uninstall.sh | bash
```

---

## Option 2: CLI via npm

Use Docxa as a standalone CLI. Requires Node.js 22+ and npm 8+.

### Prerequisites

- **Node.js**: Version 22 or higher.
- **npm**: Version 8 or higher.

### Option 2a: Using npx

The easiest npm-based approach. Always uses the latest published version.

```bash
npx @thelogicatelier/docxa init
npx @thelogicatelier/docxa discover .
```

### Option 2b: Global Installation

```bash
npm install -g @thelogicatelier/docxa

docxa init
docxa discover .
```

You can also install the skill from the CLI after a global install:

```bash
docxa skill install    # installs to ~/.claude/skills/docxa/
docxa skill status     # verify
docxa skill uninstall  # remove
```

### Option 2c: From Source (For Contributors)

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/achatt89/doxa.git
    cd doxa
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Build the Project**:
    ```bash
    npm run build
    ```

4.  **Link for Development**:
    ```bash
    npm link
    ```

## Verifying Installation

**Skill install:**
```bash
# Check the skill file exists
docxa skill status
# or
ls ~/.claude/skills/docxa/SKILL.md
```

**CLI install:**
```bash
npx @thelogicatelier/docxa --version
```
