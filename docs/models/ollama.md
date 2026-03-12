# Using Local Ollama

Docxa allows you to run your entire documentation pipeline locally using [Ollama](https://ollama.com/). This is ideal for sensitive codebases or when working offline.

## Setup Ollama

1.  **Install Ollama**: Download from [ollama.com](https://ollama.com).
2.  **Pull a Model**: We recommend `llama3.1` or `mistral`.
    ```bash
    ollama pull llama3.1
    ```

## Configure Docxa

Set your environment variables to point to your local instance:

```bash
export DOCXA_PROVIDER=ollama
export DOCXA_MODEL=llama3.1
```

## Advanced: Custom Endpoint

If Ollama is running on a different port or machine, use `DOCXA_OLLAMA_URL`:

```bash
export DOCXA_OLLAMA_URL=http://my-server:11434/v1
```

> [!TIP]
> Docxa uses the OpenAI-compatible API provided by Ollama, ensuring seamless switching between local and cloud providers.
