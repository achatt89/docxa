import { AxLLM } from 'ax-llm';
import dotenv from 'dotenv';

dotenv.config();

export type LLMProvider = 'openai' | 'anthropic' | 'google';

export interface LLMConfig {
    provider: LLMProvider;
    model: string;
    apiKey: string;
}

export class LLMWrapper {
    private client: any;

    constructor(config?: LLMConfig) {
        const provider = config?.provider || (process.env.DOCXA_PROVIDER as LLMProvider) || 'openai';
        const model = config?.model || process.env.DOCXA_MODEL || 'gpt-4';
        const apiKey = config?.apiKey || process.env.DOCXA_API_KEY;

        if (!apiKey) {
            throw new Error(`API Key for ${provider} is missing. Set DOCXA_API_KEY or pass it in config.`);
        }

        // Initialize Ax-LLM with the specific provider logic
        // Note: Assuming Ax-LLM has a unified factory or specific classes
        this.client = new AxLLM({
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
                schema, // Assuming Ax-LLM supports structured output
            });
            return response.content;
        } catch (error) {
            console.error('LLM Structured Generation Error:', error);
            throw error;
        }
    }
}
