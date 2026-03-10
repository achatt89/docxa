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

## CLI Usage (Phase 1)

```bash
# Initialize a new Docxa workspace
docxa init

# Discover architecture and frameworks in a repository
docxa discover ./repo

# Conduct a stakeholder interview
docxa interview pm

# Generate documentation
docxa generate prd
docxa generate hld

# List available documents
docxa list-documents

# Validate document consistency
docxa validate

# Explain specific architecture decisions or code sections
docxa explain
```

## Architecture

Docxa follows a modular architecture:
- `core/`: Document engine, graph, and template library.
- `agents/`: AI agents for different roles.
- `analysis/`: Code analysis and framework detection.
- `interview/`: Conversation and role engines.
- `generation/`: Document generators and validators.
- `interfaces/`: CLI, Teams Copilot, and VSCode extension.

## Environment Variables

- `DOCXA_PROVIDER`: LLM provider (openai, anthropic, google).
- `DOCXA_MODEL`: Model ID to use.
- `DOCXA_API_KEY`: API key for the selected provider.

---
Built with ❤️ for AI-native engineering teams.
