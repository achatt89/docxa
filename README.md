# Docxa 📄

Docxa is an AI-powered documentation intelligence system that helps teams maintain up-to-date business and technical documentation effortlessly. It bridges the gap between stakeholder intent and technical reality by synthesizing knowledge from interviews and source code analysis.

## ⚡ The Vision

To make software documentation a living, breathing artifact that evolves with your codebase, requiring zero manual formatting while maintaining 100% accuracy.

---

## 🚀 Delivery Channels

Choose your preferred way to interact with Docxa:

| Channel | Best For | Status |
| :--- | :--- | :--- |
| **[Claude Code Skill](docs/getting-started/installation-claude.md)** | **Interactive & Guided AI** | ✅ Available |
| **[CLI (npx/npm)](docs/getting-started/installation-cli.md)** | **CI/CD & Developers** | ✅ Available |
| **VS Code Extension** | **In-IDE Documentation** | 🛠️ Coming Soon |
| **Teams Copilot** | **Stakeholder Interviews** | 🛠️ Coming Soon |

---

## ⚙️ Configuration & Requirements

Docxa features a **lazy-initialized AI runtime**, meaning you can run many workspace commands completely locally without an API key.

### **Local Commands (No API Key Required)**
- `docxa init` - Initializes the local `.docxa/` workspace state.
- `docxa list-documents` - Lists documents.
- `docxa generate --plan <doc>` - Checks template and evidence readiness locally.
- `docxa validate` - Validates document consistency locally.

### **AI-Powered Commands (Requires Configuration)**
Commands that analyze code or generate documentation require LLM access:
- `docxa discover`
- `docxa generate <doc>`

**Environment Variables:**
You can set a provider explicitly, or let Docxa auto-detect one from the available API keys:
- `DOCXA_PROVIDER="openai" | "anthropic" | "google-gemini" | "azure-openai" | "ollama"`
- `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`, or `AZURE_OPENAI_API_KEY`. (Alternatively, use a generic `DOCXA_API_KEY`).
- `DOCXA_MODEL` — *(Recommended)* Set your preferred model ID. If unset, Docxa defaults to the latest stable flagships (e.g. `gpt-5.4`, `claude-sonnet-4-6`, `gemini-2.5-flash`).

For Azure OpenAI, also set:
- `AZURE_OPENAI_ENDPOINT`
- `AZURE_OPENAI_DEPLOYMENT`
- `AZURE_OPENAI_API_MODE` (optional, defaults to `v1`)
- `AZURE_OPENAI_API_VERSION` (optional, only used for `legacy` mode)

**Environment File Priority:**
Docxa resolves variables in the following order:
1. Exact file explicitly passed via `--env-file path/to/file`
2. `.env.local` in the working directory
3. `.env` in the working directory

---

## 📂 Workspace Structure

Docxa relies on specific directories to manage its lifecycle:

- **State & Evidence**: The `.docxa/` directory holds all auto-generated planning metadata, analyses, and generated documents.
- **Templates**: To use custom templates, place them in the following canonical directories at the root of your project:
  - `templates/documents/` — Override default document templates (e.g. `PRD.json`).
  - `templates/interviews/` — Define custom interview strategies.

---

## 🏗️ Core Architecture

Docxa is built for enterprise-grade automation. Our architecture is decoupled into specialized engines to support complex, multi-source evidence gathering.

### [Technical Architecture Deep Dive](docs/technical/hld.md)

- **[Architecture Proposal](docs/technical/proposal.md)**: Our core design principles (Evidence-Driven, Role-Aware, Local-First).
- **[High Level Design (HLD)](docs/technical/hld.md)**: Detailed C4 diagrams and system flows for the generation pipeline.
- **[Business Value Analysis](docs/technical/business-value.md)**: ROI and productivity impact research.

---

## 📖 Quick Links

- [Full Documentation](docs/README.md)
- [Getting Started Guide](docs/getting-started/quickstart.md)
- [Evidence-Based Planning Concepts](docs/concepts/evidence-planning.md)
- [Contributing Guidelines](docs/contributing/setup.md)

---

Built by [The Logic Atelier](https://thelogicatelier.com)
