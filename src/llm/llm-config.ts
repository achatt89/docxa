export type SupportedProvider = 'openai' | 'anthropic' | 'google-gemini' | 'google' | 'ollama';

export class LLMConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LLMConfigError';
  }
}

export class LLMRuntimeError extends Error {
  constructor(
    message: string,
    public readonly originalError?: any,
  ) {
    super(message);
    this.name = 'LLMRuntimeError';
  }
}

export interface LLMConfig {
  provider: Exclude<SupportedProvider, 'google'> | 'google-gemini';
  model: string;
  apiKey: string;
}

export const PROVIDER_ENV_VARS: Record<string, string[]> = {
  openai: ['OPENAI_API_KEY'],
  anthropic: ['ANTHROPIC_API_KEY'],
  google: ['GEMINI_API_KEY', 'GOOGLE_API_KEY'],
  'google-gemini': ['GEMINI_API_KEY', 'GOOGLE_API_KEY'],
  ollama: [], // Ollama usually doesn't need an API key locally
};

// Fallback defaults if no model is explicitly provided by the consumer
export const DEFAULT_MODELS: Record<string, string> = {
  openai: 'gpt-5.4',
  anthropic: 'claude-sonnet-4-6',
  google: 'gemini-2.5-flash',
  'google-gemini': 'gemini-2.5-flash',
  ollama: 'llama3.1',
};

/**
 * Resolves the LLM provider, model, and API key from environment variables.
 * Conceptually follows the Sylva pattern.
 */
export function resolveLLMConfig(): LLMConfig {
  const providerInput = (process.env.DOCXA_PROVIDER as SupportedProvider) || 'openai';

  // Map 'google' to 'google-gemini' for Ax compatibility
  const provider: any = providerInput === 'google' ? 'google-gemini' : providerInput;

  if (!['openai', 'anthropic', 'google-gemini', 'ollama'].includes(provider)) {
    throw new LLMConfigError(
      `Unsupported provider: ${providerInput}. Supported providers: openai, anthropic, google, ollama`,
    );
  }

  const model = process.env.DOCXA_MODEL || DEFAULT_MODELS[provider];
  const apiKey = resolveApiKey(provider);

  if (apiKey === undefined) {
    throw new LLMConfigError(
      `LLM configuration is required for this command.\n` +
        `Set DOCXA_PROVIDER and the appropriate API key (e.g. OPENAI_API_KEY / ANTHROPIC_API_KEY / GEMINI_API_KEY), or pass --env-file.`,
    );
  }

  return {
    provider,
    model,
    apiKey,
  };
}

function resolveApiKey(provider: SupportedProvider): string | undefined {
  // Check generic override first
  if (process.env.DOCXA_API_KEY) return process.env.DOCXA_API_KEY;

  // Ollama doesn't require a key, return empty string if no other override is found
  if (provider === 'ollama') return '';

  // Then check provider-specific vars
  const envVars = PROVIDER_ENV_VARS[provider];
  if (!envVars) return undefined;

  for (const envVar of envVars) {
    if (process.env[envVar]) return process.env[envVar];
  }

  return undefined;
}
