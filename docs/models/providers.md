# Supported Providers

Docxa is built on top of [Ax-LLM](https://github.com/ax-llm/ax), giving it support for industry-leading AI models.

## OpenAI

- **Provider Key**: `openai`
- **Recommended Model**: `gpt-5.4` (Default)
- **Configuration**: Set `OPENAI_API_KEY` or `DOCXA_API_KEY`.

## Anthropic

- **Provider Key**: `anthropic`
- **Recommended Model**: `claude-sonnet-4-6` (Default)
- **Configuration**: Set `ANTHROPIC_API_KEY` or `DOCXA_API_KEY`.

## Google Gemini

- **Provider Key**: `google-gemini` (or `google`)
- **Recommended Model**: `gemini-2.5-flash` (Default)
- **Configuration**: Set `GEMINI_API_KEY`, `GOOGLE_API_KEY`, or `DOCXA_API_KEY`.

## Ollama (Local)

Docxa supports local models via Ollama for teams requiring maximum privacy and zero cost.

- **Provider Key**: `ollama`
- **Recommended Model**: `llama3.1` (Default)
- **Configuration**: No API key required. Assumes Ollama is running at `http://localhost:11434`.
- **Custom URL**: Set `DOCXA_OLLAMA_URL` if your Ollama instance is on a different server/port.

---
See the [Ollama Guide](ollama.md) for more details on local setup.
