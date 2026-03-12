# Configuration

Docxa uses environment variables for configuration. You can manage these via a `.env` file in your workspace root or by passing them directly to your shell.

## Environment Variables

| Variable | Description | Default |
| :------- | :---------- | :------ |
| `DOCXA_PROVIDER` | LLM Provider (`openai`, `anthropic`, `google-gemini`, `ollama`) | `openai` |
| `DOCXA_MODEL` | Specific model to use (e.g., `gpt-4o`, `llama3.1`) | *Provider-specific* |
| `DOCXA_API_KEY` | Overwrites any provider-specific API keys | `None` |
| `OPENAI_API_KEY` | Required if provider is `openai` | `None` |
| `ANTHROPIC_API_KEY` | Required if provider is `anthropic` | `None` |
| `GEMINI_API_KEY` | Required if provider is `google-gemini` | `None` |
| `DOCXA_OLLAMA_URL` | Custom endpoint for Ollama | `http://localhost:11434/v1` |

## Local `.env` File

Docxa automatically loads environment variables from:
1. `.env.local`
2. `.env`

Example `.env`:
```env
DOCXA_PROVIDER=openai
OPENAI_API_KEY=sk-proj-xxxxxx
```

## Custom Env File

You can specify a custom environment file using the `--env-file` flag:

```bash
docxa generate prd --env-file .env.production
```
