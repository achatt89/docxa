# Installation: CLI

Docxa can be installed as a global CLI tool or run directly using `npx`.

## Prerequisites

- **Node.js**: Version 18.x or higher.
- **NPM**: Version 9.x or higher.
- **LLM Provider**: (Optional but recommended) An API key for OpenAI, Anthropic, or a local Ollama instance.

## Option 1: Run with `npx` (No installation needed)

The fastest way to use Docxa without cluttering your global environment:

```bash
# Initialize a workspace
npx @thelogicatelier/docxa init

# Discover technical context
npx @thelogicatelier/docxa discover .
```

## Option 2: Global Installation

If you use Docxa frequently, install it globally:

```bash
npm install -g @thelogicatelier/docxa
```

Once installed, you can use the `docxa` command directly:

```bash
docxa init
docxa discover .
```

## Configuration

Set up your environment variables to connect to an LLM provider:

```bash
export DOCXA_PROVIDER=openai
export OPENAI_API_KEY=sk-proj-xxxxxx
```

For more details on configuration, see the [Configuration Guide](configuration.md).
