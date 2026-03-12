# Evidence-Based Planning

Traditional AI documentation tools often suffer from "hallucinations" because they lack context. Docxa solves this via **Evidence-Based Planning**.

## What is Evidence?

Evidence is simply structured context that the AI needs to write a specific section of a document. Docxa recognizes several types of evidence:

- **Business Context**: Goals, target audience, problem statements. (Usually from interviews).
- **Technical Context**: Frameworks, architecture patterns, dependencies. (Usually from repo analysis).
- **Existing Docs**: Upstream documents (e.g., a BRD provides evidence for a PRD).

## The Readiness Check

When you run `docxa generate --plan`, Doxa evaluates every section of the target template against its **Evidence Requirements**.

| Requirement | Satisfied By | Status |
| :---------- | :----------- | :----- |
| `business_context` | PRD Interview | ✅ |
| `arch_patterns` | Repository Analysis | ✅ |
| `ux_flow` | *Missing* | ⚠️ |

## Generation Modes

1.  **Strict**: Blocks generation if any required evidence is missing.
2.  **Flexible**: Warns you about missing evidence but proceeds anyway.
3.  **Assisted**: Identifies missing context and suggests specifically which interview role to run to fill the gap.
