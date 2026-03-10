import dotenv from 'dotenv';

dotenv.config();

export type LLMProvider = 'openai' | 'anthropic' | 'google';

export interface LLMConfig {
    provider: LLMProvider;
    model: string;
    apiKey: string;
}

/**
 * Placeholder for Ax-LLM since the package is currently unavailable in the registry.
 * This ensures the project builds and provides a clear integration point.
 */
class AxLLMMock {
    constructor(config: any) {
        console.log('LLM Initialized with:', config.provider, config.model);
    }

    async chat(params: any): Promise<{ content: string }> {
        return { content: `Simulated response from ${params.messages[params.messages.length - 1].content.slice(0, 50)}...` };
    }
}

export class LLMWrapper {
    private client: any;

    constructor(config?: LLMConfig) {
        const provider = config?.provider || (process.env.DOCXA_PROVIDER as LLMProvider) || 'openai';
        const model = config?.model || process.env.DOCXA_MODEL || 'gpt-4';
        const apiKey = config?.apiKey || process.env.DOCXA_API_KEY;

        if (!apiKey && process.env.NODE_ENV !== 'test') {
            console.warn(`API Key for ${provider} is missing. Set DOCXA_API_KEY for real LLM calls.`);
        }

        this.client = new AxLLMMock({
            provider,
            model,
            apiKey,
        });
    }

    async generate(prompt: string, systemPrompt?: string): Promise<string> {
        try {
            const response = await this.client.chat({
                messages: [
                    ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
                    { role: 'user', content: prompt }
                ]
            });
            return response.content;
        } catch (error) {
            console.error('LLM Generation Error:', error);
            throw error;
        }
    }

    async generateStructured<T>(prompt: string, schema: any, systemPrompt?: string): Promise<T> {
        try {
            const response = await this.client.chat({
                messages: [
                    ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
                    { role: 'user', content: prompt }
                ],
                schema,
            });
            return response.content;
        } catch (error) {
            console.error('LLM Structured Generation Error:', error);
            throw error;
        }
    }
}
