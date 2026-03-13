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

## Skill Commands

These commands manage the Docxa Claude Code skill installation. Alternatively,
use the one-line shell installer (no npm required):

```bash
curl -fsSL https://raw.githubusercontent.com/achatt89/docxa/main/install.sh | bash
```

### `docxa skill install`
Install the Docxa skill into Claude Code (`~/.claude/skills/docxa/`). After
installation, reload Claude Code and invoke with `/docxa`.

### `docxa skill uninstall`
Remove the Docxa skill from Claude Code.

### `docxa skill status`
Show whether the Docxa skill is installed and its file path.

## Shared Flags

- `--help`: Show usage information.
- `--version`: Show current Docxa version.
- `--verbose`: Enable detailed logging.
