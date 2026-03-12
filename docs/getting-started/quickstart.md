# Quick Start

Get your first Docxa documentation generated in minutes.

## 1. Initialize Workspace

Run this inside your project repository to set up the Docxa state directory.

```bash
docxa init
```

## 2. Analyze Your Codebase

If you have an existing repository, let Docxa analyze it to understand your frameworks and architecture patterns.

```bash
docxa discover .
```

This generates `.docxa/analysis.json`, which serves as "technical evidence" for future document generation.

## 3. Start a Stakeholder Interview

Need to write a PRD? Doxa can interview you (or your PM) to gather the necessary business context.

```bash
docxa interview start -d PRD -r product_manager
```

## 4. Generate Documentation

Once you have enough evidence (from analysis or interviews), generate your document.

```bash
docxa generate prd --plan
```

The `--plan` flag shows you a "Readiness Plan" before generation starts, identifying any missing evidence.

---

Explore the [Core Concepts](../concepts/what-is-docxa.md) to understand how Doxa uses "Evidence" to ensure high-quality documentation.
