/**
 * Generates the SKILL.md content for the Claude Code skill registration.
 */
export function generateSkillContent(version: string): string {
  return `---
name: docxa
description: >
  AI-powered documentation intelligence for software projects. Generates and
  manages structured docs (BRD, PRD, FRD, TRD, HLD, LLD, NFR, ADR) through
  evidence-based planning, stakeholder interviews, and repository analysis.
  Triggers on: "docxa", "generate documentation", "document my project",
  "create PRD", "create BRD", "stakeholder interview", "architecture document",
  "technical documentation", "docxa generate", "docxa interview",
  "docxa discover", "docxa init", "docxa validate".
argument-hint: "init | discover | interview | generate | validate | status"
license: MIT
version: ${version}
---

# Docxa — AI Documentation Intelligence

Docxa is an evidence-driven documentation system that generates structured
software project docs (BRD, PRD, FRD, TRD, HLD, LLD, NFR, ADR) using LLM
agents, stakeholder interviews, and repository analysis.

## Quick Reference

| Command | What it does |
|---------|-------------|
| \`/docxa init\` | Initialize workspace and guide first steps |
| \`/docxa discover\` | Analyze codebase for architecture and tech stack |
| \`/docxa interview\` | Run a stakeholder interview for a document type |
| \`/docxa generate\` | Generate a documentation artifact |
| \`/docxa validate\` | Check document consistency |
| \`/docxa status\` | Show workspace state and readiness |

---

## Document Types

| ID  | Full Name                        | Phase | Depends On       |
|-----|----------------------------------|-------|------------------|
| BRD | Business Requirements Document   | 1     | —                |
| PRD | Product Requirements Document    | 2     | BRD              |
| FRD | Functional Requirements Document | 3     | PRD              |
| TRD | Technical Requirements Document  | 4     | FRD              |
| NFR | Non-Functional Requirements      | 4     | TRD              |
| HLD | High Level Design                | 5     | TRD              |
| LLD | Low Level Design                 | 6     | HLD              |
| ADR | Architecture Decision Record     | any   | HLD, TRD         |

---

## Workflows

### Starting a New Project (Greenfield)

When the user wants to document a brand-new project:

\`\`\`bash
# 1. Initialize workspace
docxa init -m greenfield

# 2. Start stakeholder interviews — begin with business context
docxa interview start -d BRD -r business_stakeholder -n "Alice"
docxa interview start -d PRD -r product_manager -n "Bob"

# 3. Generate documents in dependency order
docxa generate brd
docxa generate prd
docxa generate frd --mode flexible
\`\`\`

**Key advice:**
- BRD must be generated before PRD (PRD depends on BRD)
- Use \`--plan\` flag first to check evidence readiness
- Multiple stakeholders can contribute via separate interview sessions

### Documenting an Existing Repository

\`\`\`bash
# 1. Initialize in existing mode (auto-detected if src/ exists)
docxa init

# 2. Analyze codebase (satisfies technical evidence automatically)
docxa discover .

# 3. Check readiness before generating
docxa generate hld --plan

# 4. Generate technical docs (repository analysis provides evidence)
docxa generate trd --mode flexible
docxa generate hld
docxa generate lld
\`\`\`

**Key advice:**
- Always run \`docxa discover\` first on existing projects
- \`docxa discover\` saves results to \`.docxa/analysis/repo-analysis.json\` and satisfies
  \`technical_context\` and \`architecture_context\` evidence requirements
- Use \`--mode assisted\` for specific suggestions on missing evidence

### Checking Readiness Before Generating

\`\`\`bash
# Show evidence readiness report without generating
docxa generate prd --plan

# Example output:
# Status: READY
# Confidence: HIGH
# Missing Optional Evidence: functional_context
# Suggestions:
# - Run interview for FRD with role product_manager to capture functional context
\`\`\`

---

## CLI Commands Reference

### \`docxa init\`
Initialize a new Docxa workspace with smart mode detection.

\`\`\`bash
docxa init                    # auto-detects greenfield vs existing
docxa init -m existing        # force existing mode
docxa init -m greenfield      # force greenfield mode
\`\`\`

### \`docxa discover [path]\`
Scan repository and detect languages, frameworks, and architecture.

\`\`\`bash
docxa discover .              # analyze current directory
docxa discover /path/to/repo  # analyze another path
\`\`\`
Output saved to \`.docxa/analysis/repo-analysis.json\`.

### \`docxa interview start\`
Start a role-aware stakeholder interview for a document type.

\`\`\`bash
docxa interview start -d PRD -r product_manager
docxa interview start -d BRD -r business_stakeholder -n "Alice"
docxa interview start -d TRD -r solution_architect
docxa interview start -d LLD -r engineering_lead
docxa interview start -d NFR -r devops_engineer
\`\`\`

**Available roles:**
- \`business_stakeholder\` — for BRD
- \`product_manager\` — for PRD, FRD
- \`solution_architect\` — for TRD, HLD, ADR
- \`engineering_lead\` — for LLD
- \`devops_engineer\` — for NFR

### \`docxa interview continue <sessionId>\`
Resume a paused interview session.

### \`docxa interview list\`
Show all interview sessions with status.

### \`docxa generate <type>\`
Generate a documentation artifact.

\`\`\`bash
docxa generate brd
docxa generate prd --plan              # check readiness first
docxa generate hld --mode strict       # block if evidence missing
docxa generate trd --mode flexible     # warn but proceed
docxa generate lld --mode assisted     # get role-specific suggestions
\`\`\`

**Generation modes:**
- \`strict\` — blocks if required evidence is missing
- \`flexible\` — warns but allows generation with incomplete context *(default)*
- \`assisted\` — shows what interviews/actions would fill the gaps

### \`docxa list-documents\`
List all generated documents in the workspace.

### \`docxa validate\`
Check cross-document consistency.

### \`docxa skill install\`
Install the Docxa skill into Claude Code (\`~/.claude/skills/docxa/\`).

### \`docxa skill uninstall\`
Remove the Docxa skill from Claude Code.

### \`docxa skill status\`
Show whether the skill is installed and its path.

---

## Environment Configuration

Docxa supports multiple LLM providers via environment variables:

\`\`\`bash
# OpenAI (default)
export DOCXA_PROVIDER=openai
export OPENAI_API_KEY=sk-...

# Anthropic
export DOCXA_PROVIDER=anthropic
export ANTHROPIC_API_KEY=sk-ant-...

# Google Gemini
export DOCXA_PROVIDER=google-gemini
export GOOGLE_GENAI_API_KEY=...

# Local Ollama
export DOCXA_PROVIDER=ollama
export DOCXA_OLLAMA_URL=http://localhost:11434/v1
export DOCXA_MODEL=llama3.1
\`\`\`

Custom model selection:
\`\`\`bash
export DOCXA_MODEL=gpt-4o        # default for openai
export DOCXA_MODEL=claude-3-5-sonnet-20241022  # for anthropic
\`\`\`

Use \`--env-file\` to load from a custom path:
\`\`\`bash
docxa --env-file .env.production generate prd
\`\`\`

---

## Workspace Structure

\`\`\`
.docxa/
├── project.json          # Project config (name, mode, paths)
├── analysis.json         # Repository analysis (from docxa discover)
├── stakeholders.json     # Stakeholder registry
├── documents/
│   ├── brd.md            # Generated BRD
│   ├── prd.md            # Generated PRD
│   └── ...
├── adr/                  # Architecture Decision Records
└── interviews/           # Interview sessions (JSON)
\`\`\`

---

## Evidence Requirements

Docxa tracks what evidence is available before generating documents.
Evidence can come from existing documents, completed interviews, or
repository analysis.

| Document | Required Evidence                          |
|----------|--------------------------------------------|
| BRD      | business_context                           |
| PRD      | business_context, product_context          |
| FRD      | product_context, functional_context        |
| TRD      | functional_context, technical_context      |
| NFR      | technical_context, quality_attribute_context|
| HLD      | technical_context, architecture_context    |
| LLD      | architecture_context, implementation_context|
| ADR      | architecture_context, decision_context     |

Repository analysis (\`docxa discover\`) satisfies:
\`technical_context\`, \`architecture_context\`, \`functional_context\`

---

## Common Troubleshooting

**Generation blocked (strict mode):**
Run \`docxa generate <type> --plan\` to see missing evidence. Run the
suggested interviews or switch to \`--mode flexible\`.

**LLM not configured:**
Commands like \`init\`, \`list-documents\`, and \`generate --plan\` work
without API keys. Only \`discover\` and full \`generate\` require an LLM.

**Interview not found:**
Ensure interview templates exist in \`templates/interviews/\`. Run
\`docxa interview list\` to verify session status.

**Workspace not initialized:**
Run \`docxa init\` before any other commands.

---

---

## Critical Instructions for AI Agents (Claude Code)

To ensure the "Docxa Project Story" is consistently executed:

1. **Prioritize CLI Engine**: ALWAYS execute \`docxa\` CLI commands via the terminal instead of manually creating \`.docxa\` files or analyzing codebases agentically. The CLI engine handles specialized dependency hoisting and hallucination-prevention constraints.
2. **Sequential Flow**: Never skip \`docxa init\` and \`docxa discover\`. These populate the evidence model used for all subsequent document generation.
3. **Intent-Gap Interviews**: On existing projects, recognize that while \`docxa discover\` fills the technical evidence, you MUST still run \`docxa interview\` to capture the business and product intent from the user.

---

## How to Assist Users

When a user invokes \`/docxa\`:

1. **Understand their goal** — new project vs existing, which doc type
2. **Check prerequisites** — is a workspace initialized? Is the LLM configured?
3. **Recommend the right workflow** — existing projects *require* \`discover\` first
4. **Guide through evidence gathering** — explain that \`discover\` + \`interview\` = complete story
5. **Help interpret readiness reports** — focus on the "Intent Gap" Suggestion
6. **Offer command construction** — compose the exact CLI command for them
`;
}
