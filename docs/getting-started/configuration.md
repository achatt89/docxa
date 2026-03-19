# Configuration

Docxa uses environment variables for configuration. You can manage these via a `.env` file in your workspace root or by passing them directly to your shell.

## Environment Variables

| Variable | Description | Default |
| :------- | :---------- | :------ |
| `DOCXA_PROVIDER` | LLM Provider (`openai`, `anthropic`, `google-gemini`, `azure-openai`, `ollama`) | `openai` |
| `DOCXA_MODEL` | Specific model to use (e.g., `gpt-4o`, `llama3.1`) | *Provider-specific* |
| `DOCXA_API_KEY` | Overwrites any provider-specific API keys | `None` |
| `OPENAI_API_KEY` | Required if provider is `openai` | `None` |
| `ANTHROPIC_API_KEY` | Required if provider is `anthropic` | `None` |
| `GEMINI_API_KEY` | Required if provider is `google-gemini` | `None` |
| `AZURE_OPENAI_API_KEY` | Required if provider is `azure-openai` | `None` |
| `AZURE_OPENAI_ENDPOINT` | Azure OpenAI resource endpoint | `None` |
| `AZURE_OPENAI_DEPLOYMENT` | Azure deployment/model name | `None` |
| `AZURE_OPENAI_API_MODE` | Azure API mode (`v1` or `legacy`) | `v1` |
| `AZURE_OPENAI_API_VERSION` | Required only for `legacy` mode | `2024-10-21` |
| `DOCXA_OLLAMA_URL` | Custom endpoint for Ollama | `http://localhost:11434/v1` |

## Local `.env` File

Docxa automatically loads environment variables from:
1. `.env.local`
2. `.env`

If `DOCXA_PROVIDER` is omitted, Docxa will auto-detect a provider from the available credentials, preferring Azure OpenAI, then OpenAI, Anthropic, Gemini, and finally Ollama.

Example `.env`:
```env
DOCXA_PROVIDER=openai
OPENAI_API_KEY=sk-proj-xxxxxx
```

Azure example:
```env
DOCXA_PROVIDER=azure-openai
AZURE_OPENAI_API_KEY=your-azure-key
AZURE_OPENAI_ENDPOINT=https://your-resource-name.cognitiveservices.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-5-mini
AZURE_OPENAI_API_MODE=v1
DOCXA_MODEL=gpt-5-mini
```

## Custom Env File

You can specify a custom environment file using the `--env-file` flag:

```bash
docxa generate prd --env-file .env.production
```
