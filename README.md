# Docxa

Docxa is an AI-powered documentation intelligence system designed to help teams maintain up-to-date business and technical documentation effortlessly. 

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Build the project
npm run build

# 3. Initialize workspace
./bin/docxa init

# 4. Discover architecture
./bin/docxa discover .

# 5. Generate documentation
./bin/docxa generate prd --plan
```

## 🛠️ Installation

Docxa requires **Node.js v20+**.

```bash
git clone https://github.com/achatt89/doxa.git
cd doxa
npm install
npm run build
npm link # Optional: available globally as 'docxa'
```

## 🧠 LLM Configuration

Docxa supports OpenAI, Anthropic, Gemini, and local **Ollama** models.

### Local Ollama Setup
1. Install [Ollama](https://ollama.com).
2. Run `ollama pull llama3.1`.
3. Configure Docxa:
   ```bash
   export DOCXA_PROVIDER=ollama
   export DOCXA_MODEL=llama3.1
   ```

### Other Providers
Configure via environment variables or a `.env` file:
- `DOCXA_PROVIDER`: `openai` (default), `anthropic`, `google-gemini`, `ollama`
- `OPENAI_API_KEY`: Required for OpenAI
- `ANTHROPIC_API_KEY`: Required for Anthropic
- `GEMINI_API_KEY`: Required for Gemini

## 📚 Documentation

For comprehensive guides, architecture deep-dives, and CLI reference, visit our documentation site:

**[Docxa Documentation Site](https://achatt89.github.io/doxa)** (Built with Honkit)

---
Built with ❤️ for AI-native engineering teams.
