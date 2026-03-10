# Docxa

Docxa is an AI-powered documentation intelligence system designed to help teams maintain up-to-date business and technical documentation effortlessly. It uses **TypeScript**, **Node.js**, and **Ax-LLM** to generate or reverse-engineer documentation from source code or stakeholder interviews.

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

## CLI Usage

```bash
# Initialize a new Docxa workspace
docxa init

# Discover architecture and frameworks in a repository
docxa discover ./repo

# List available interview sessions
docxa interview list

# Start a stakeholder interview
docxa interview start -d PRD -r product_manager

# Continue an existing interview session
docxa interview continue <sessionId>

# Generate documentation with planning
docxa generate hld --plan
docxa generate hld --mode flexible
```

## Evidence-Based Planning

Docxa uses an intelligent **Generation Planner** to evaluate document readiness. Instead of simple file checks, it maps documents to **Evidence Requirements** (e.g., `business_context`, `architecture_context`).

- **Multi-Source Evidence**: Requirements can be satisfied by existing documents, interview sessions, or repository analysis.
- **Generation Modes**:
  - `strict`: Blocks generation if any required evidence is missing.
  - `flexible`: Allows generation with warnings if minimum context exists.
  - `assisted`: Provides specific role-aware suggestions to gather missing context.

## Structured Stakeholder Interviews

Docxa provides role-aware interview definitions to bridge information gaps.
- **Location**: Interview definitions are stored in `templates/interviews/*.json`.
- **Available Roles**: `product_manager`, `solution_architect`, `engineering_lead`, `devops_engineer`, `business_stakeholder`.
- **Consistency**: This ensures that stakeholder answers are accurately traced to the correct sections during document generation.

## Repository Analysis Persistence

Docxa can analyze your repository to automatically satisfy technical evidence requirements.
- **Persistence**: Running `docxa discover` saves analysis results to `.docxa/analysis.json`.
- **Evidence-Based Planning**: `docxa generate` loads this analysis to satisfy requirements like `frameworks` or `architecture`.
- **Technical Docs**: This strengthens readiness planning for technical documents (TRD, HLD, LLD) even when upstream documentation is missing.
- **Workflow**: If critical technical context is missing, Docxa will suggest running `docxa discover` first.

## Architecture

Docxa follows a modular architecture:
- `core/`: Document engine, graph, and template library.
- `agents/`: AI agents for different roles.
- `analysis/`: Code analysis and framework detection.
- `interview/`: Conversation and role engines.
- `generation/`: Document generators and validators.
- `interfaces/`: CLI, Teams Copilot, and VSCode extension.

Docxa uses a rich JSON-based template system to define the structure and guidance for generated documents. 

- **Location**: Templates are stored in `templates/documents/*.json`.
- **Validation**: Every template is validated against a strict Zod schema (`src/generation/template-schema.ts`) on startup.
- **Hierarchical Sections**: Supports nested sections with specific purposes, guidance, and required flags.
- **Prompt Hints**: Templates include `systemIntent`, `rules`, `mustDo`, and `mustNotDo` to guide the LLM precisely.

### Adding a New Template
To add a new document type (e.g., `HLD`):
1. Create `templates/documents/hld.template.json`.
2. Define the `documentId`, `name`, and `sections`.
3. Add `promptHints` to ensure the AI follows specific architectural standards.
4. The system will automatically detect and load the template on the next run.

## Environment Variables

---
Built with ❤️ for AI-native engineering teams.
