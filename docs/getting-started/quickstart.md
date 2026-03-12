# Quick Start

Get your first Docxa documentation generated in minutes using `npx`.

## 1. Initialize Workspace

Run this inside your project repository to set up the Docxa state directory.

```bash
npx @thelogicatelier/docxa init
```

## 2. Analyze Your Codebase

Let Docxa analyze your repository to understand your frameworks and architecture patterns.

```bash
npx @thelogicatelier/docxa discover .
```

This generates `.docxa/analysis.json`, which serves as "technical evidence" for future document generation.

## 3. Start a Stakeholder Interview

Need to write a PRD? Doxa can interview you (or your PM) to gather the necessary business context.

```bash
npx @thelogicatelier/docxa interview start -d PRD -r product_manager
```

## 4. Generate Documentation

Once you have enough evidence (from analysis or interviews), generate your document.

```bash
npx @thelogicatelier/docxa generate prd --plan
```

The `--plan` flag shows you a "Readiness Plan" before generation starts, identifying any missing evidence.

---

Explore the [Core Concepts](../concepts/what-is-docxa.md) to understand how Doxa uses "Evidence" to ensure high-quality documentation.
