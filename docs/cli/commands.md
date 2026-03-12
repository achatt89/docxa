# CLI Commands Reference

Docxa provides a powerful command-line interface for managing the documentation lifecycle. You can run these commands via `npx @thelogicatelier/docxa`.

## Core Commands

### `docxa init`
Initializes a new Docxa workspace in the current directory. Creates the `.docxa/` folder.

### `docxa discover <path>`
Analyzes the codebase at the given path. Detects frameworks and patterns.
- **Output**: Persists results to `.docxa/analysis.json`.

### `docxa interview start`
Starts a new stakeholder interview.
- `-d, --document <type>`: Document type (e.g., PRD, TRD).
- `-r, --role <role>`: Stakeholder role (e.g., product_manager).

### `docxa generate <type>`
Generates a document.
- `--plan`: Show the readiness plan before generating.
- `--mode <strict|flexible>`: Control how missing evidence is handled.
- `--env-file <path>`: Load environment variables from a specific file.

## Shared Flags

- `--help`: Show usage information.
- `--version`: Show current Docxa version.
- `--verbose`: Enable detailed logging.
