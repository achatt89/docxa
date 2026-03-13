# Docxa 📄

Docxa is an AI-powered documentation intelligence system that generates structured software project documentation (BRD, PRD, FRD, TRD, HLD, LLD, NFR, ADR) through evidence-based planning, stakeholder interviews, and repository analysis. It runs as a **Claude Code skill** and a standalone **CLI**.

📖 **[Full Documentation](https://achatt89.github.io/docxa/)**

---

## Install the Claude Code Skill

**One-command install (macOS/Linux):**
```bash
curl -fsSL https://raw.githubusercontent.com/achatt89/docxa/main/install.sh | bash
```

**One-command install (Windows PowerShell):**
```powershell
irm https://raw.githubusercontent.com/achatt89/docxa/main/install.ps1 | iex
```

**Manual install:**
```bash
git clone https://github.com/achatt89/docxa.git
cd docxa
./install.sh          # macOS/Linux
.\install.ps1         # Windows PowerShell
```

After installing, reload Claude Code and use `/docxa` to start generating documentation.

**To uninstall:**
```bash
curl -fsSL https://raw.githubusercontent.com/achatt89/docxa/main/uninstall.sh | bash
```

---

## Quick Start (Skill)

```
/docxa init
/docxa discover .
/docxa interview
/docxa generate prd
```

---

## Features

- **Greenfield Mode**: Generate documentation through guided stakeholder interviews.
- **Existing Project Mode**: Analyze existing repositories to reverse-engineer documentation.
- **Support for Multiple Document Types**:
  - Business Requirements Document (BRD)
  - Product Requirements Document (PRD)
  - Functional Requirements Document (FRD)
  - Technical Requirements Document (TRD)
  - High Level Design (HLD)
  - Low Level Design (LLD)
  - Non-Functional Requirements (NFR)
  - Architecture Decision Records (ADR)
- **Agentic Workflows**: Powered by Ax-LLM agents (PM, Architect, Developer, etc.).
- **Workspace-Driven**: Maintains state in a `.docxa/` directory.
- **Local-First AI**: Support for local Ollama models (Llama 3.1, Mistral, etc.).

---

## CLI

Docxa is published to npm and runs anywhere without cloning the repo.

**Run without installing:**
```bash
npx @thelogicatelier/docxa init
npx @thelogicatelier/docxa discover .
npx @thelogicatelier/docxa interview start -d PRD -r product_manager
npx @thelogicatelier/docxa generate prd --plan
```

**Install globally:**
```bash
npm install -g @thelogicatelier/docxa

docxa init
docxa discover .
docxa generate prd --plan

# Manage the Claude Code skill from the CLI too:
docxa skill install    # installs to ~/.claude/skills/docxa/
docxa skill status
docxa skill uninstall
```

**Configure your LLM provider:**
```bash
export DOCXA_PROVIDER=openai        # openai | anthropic | google-gemini | ollama
export OPENAI_API_KEY=sk-proj-xxxx
```
*`.env` and `.env.local` files are loaded automatically. LLM credentials are only needed for AI commands (`discover`, full `generate`). Commands like `init`, `list-documents`, and `generate --plan` work without them.*

## Evidence-Based Planning

Docxa uses an intelligent **Generation Planner** to evaluate document readiness. Instead of simple file checks, it maps documents to **Evidence Requirements** (e.g., `business_context`, `architecture_context`).

- **Multi-Source Evidence**: Requirements can be satisfied by existing documents, interview sessions, or repository analysis.
- **Generation Modes**:
  - `strict`: Blocks generation if any required evidence is missing.
  - `flexible`: Allows generation with warnings if minimum context exists.
  - `assisted`: Provides specific role-aware suggestions to gather missing context.

## Structured Stakeholder Interviews

Docxa bridges the "information gap" between business stakeholders and technical teams through guided, role-aware interviews.
- **Roles Registry**: `product_manager`, `solution_architect`, `engineering_lead`, `devops_engineer`, `business_stakeholder`.
- **Consistency**: Ensures that stakeholder answers are accurately traced to the correct sections during document generation.

## Repository Analysis Persistence

Docxa can analyze your repository to automatically satisfy technical evidence requirements.
- **Persistence**: Running `docxa discover` saves analysis results to `.docxa/analysis.json`.
- **Workflow**: If critical technical context is missing, Docxa will suggest running `docxa discover` first.

## Environment Overrides

- `DOCXA_PROVIDER`: `openai` (default), `anthropic`, `google-gemini`, `ollama`.
- `DOCXA_MODEL`: Specific model to use (e.g., `gpt-4o`, `llama3.1`).
- `DOCXA_API_KEY`: Generic override for any provider.
- `DOCXA_OLLAMA_URL`: Custom endpoint for Ollama (defaults to `http://localhost:11434/v1`).

## Test Structure
Unit tests are located at `tests/` which mirror the `/src` folder structure.
Execute tests by running:
```bash
npm test
```

## Technical Architecture & CI/CD Integration

Docxa is built for enterprise-grade automation. Our architecture is decoupled into specialized engines (Interview, Analysis, Planning, and Generation) to support complex, multi-source evidence gathering.

For power users and contributors looking to integrate Docxa into CI/CD pipelines or extend its capabilities:
- **[Architecture Proposal](docs/technical/proposal.md)**: Deep dive into our core design principles (Evidence-Driven, Role-Aware, Local-First).
- **[High Level Design (HLD)](docs/technical/hld.md)**: Detailed C4 diagrams and system flows for the generation pipeline.

## Contributing

We strictly follow a feature-branch workflow.
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes
4. Push to the Branch
5. Open a Pull Request

---
Built by [The Logic Atelier](https://thelogicatelier.com)
