# Docxa 📄

Docxa is an AI-powered documentation intelligence system designed to help teams maintain up-to-date business and technical documentation effortlessly. It uses **TypeScript**, **Node.js**, and **Ax-LLM** to generate or reverse-engineer documentation from source code or stakeholder interviews.

📖 **[Full Documentation](https://achatt89.github.io/docxa/)**

### Features

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

### Setup

Install dependencies:
```bash
npm install
```

Configure your environment variables:
```bash
# Set your preferred provider and API keys
export DOCXA_PROVIDER=openai
export OPENAI_API_KEY=sk-proj-xxxxxx
```
*Docxa also supports `.env` and `.env.local` files for automatic configuration. Note that LLM credentials are only mandatory for commands that use AI (like `discover` or full `generate`). Basic commands like `init`, `list-documents`, and `generate --plan` work without API keys.*

Build the project:
```bash
npm run build
```

### Execution

The project is published to the NPM registry and can be executed natively anywhere!

**Option 1: Run seamlessly without installing**
```bash
# Initialize a new Docxa workspace
npx @thelogicatelier/docxa init

# Discover architecture and frameworks in a repository
npx @thelogicatelier/docxa discover .

# Start a stakeholder interview
npx @thelogicatelier/docxa interview start -d PRD -r product_manager

# Generate documentation with planning
npx @thelogicatelier/docxa generate prd --plan
```

**Option 2: Install globally on your system**
```bash
npm install -g @thelogicatelier/docxa

# Once installed globally, you can execute it anywhere!
docxa init
docxa discover .
docxa generate prd --plan
```

### Evidence-Based Planning

Docxa uses an intelligent **Generation Planner** to evaluate document readiness. Instead of simple file checks, it maps documents to **Evidence Requirements** (e.g., `business_context`, `architecture_context`).

- **Multi-Source Evidence**: Requirements can be satisfied by existing documents, interview sessions, or repository analysis.
- **Generation Modes**:
  - `strict`: Blocks generation if any required evidence is missing.
  - `flexible`: Allows generation with warnings if minimum context exists.
  - `assisted`: Provides specific role-aware suggestions to gather missing context.

### Structured Stakeholder Interviews

Docxa bridges the "information gap" between business stakeholders and technical teams through guided, role-aware interviews.
- **Roles Registry**: `product_manager`, `solution_architect`, `engineering_lead`, `devops_engineer`, `business_stakeholder`.
- **Consistency**: Ensures that stakeholder answers are accurately traced to the correct sections during document generation.

### Repository Analysis Persistence

Docxa can analyze your repository to automatically satisfy technical evidence requirements.
- **Persistence**: Running `docxa discover` saves analysis results to `.docxa/analysis.json`.
- **Workflow**: If critical technical context is missing, Docxa will suggest running `docxa discover` first.

### Environment Overrides

- `DOCXA_PROVIDER`: `openai` (default), `anthropic`, `google-gemini`, `ollama`.
- `DOCXA_MODEL`: Specific model to use (e.g., `gpt-4o`, `llama3.1`).
- `DOCXA_API_KEY`: Generic override for any provider.
- `DOCXA_OLLAMA_URL`: Custom endpoint for Ollama (defaults to `http://localhost:11434/v1`).

### Test Structure
Unit tests are located at `tests/` which mirror the `/src` folder structure.
Execute tests by running:
```bash
npm test
```

### Technical Architecture & CI/CD Integration

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
