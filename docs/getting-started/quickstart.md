# Quick Start

Get your first Docxa documentation generated in minutes. Choose the path that matches how you installed Docxa.

## Via Claude Code Skill (`/docxa`)

If you installed via `curl | bash` or `irm | iex`, use `/docxa` commands directly in Claude Code:

```
/docxa init
/docxa discover .
/docxa interview
/docxa generate prd
```

Claude guides you through each step interactively — no terminal required.

---

## Via CLI (`npx` / global install)

### 1. Initialize Workspace

```bash
npx @thelogicatelier/docxa init
```

### 2. Analyze Your Codebase

```bash
npx @thelogicatelier/docxa discover .
```

This generates `.docxa/analysis.json`, which serves as "technical evidence" for future document generation.

### 3. Start a Stakeholder Interview

```bash
npx @thelogicatelier/docxa interview start -d PRD -r product_manager
```

### 4. Generate Documentation

```bash
npx @thelogicatelier/docxa generate prd --plan
```

The `--plan` flag shows you a "Readiness Plan" before generation starts, identifying any missing evidence.

---

Explore the [Core Concepts](../concepts/what-is-docxa.md) to understand how Doxa uses "Evidence" to ensure high-quality documentation.
