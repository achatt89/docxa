
export type SupportedProvider = 'openai' | 'anthropic' | 'google-gemini' | 'google' | 'ollama';

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
    ollama: [] // Ollama usually doesn't need an API key locally
};

export const DEFAULT_MODELS: Record<string, string> = {
    openai: 'gpt-4o',
    anthropic: 'claude-3-5-sonnet-20240620',
    google: 'gemini-1.5-pro',
    'google-gemini': 'gemini-1.5-pro',
    ollama: 'llama3.1'
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
        throw new Error(`Unsupported provider: ${providerInput}. Supported providers: openai, anthropic, google, ollama`);
    }

    const model = process.env.DOCXA_MODEL || DEFAULT_MODELS[provider];
    const apiKey = resolveApiKey(provider);

    if (!apiKey) {
        const vars = PROVIDER_ENV_VARS[provider].join(' or ');
        throw new Error(`API key missing for provider ${provider}. Please set ${vars} or DOCXA_API_KEY.`);
    }

    return {
        provider,
        model,
        apiKey
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
