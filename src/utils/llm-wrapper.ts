import { AxAI } from '@ax-llm/ax';
import { LLMConfig } from '../llm/llm-config.js';

export class LLMWrapper {
    private client: AxAI;

    constructor(config: LLMConfig) {
        const { provider, model, apiKey } = config;

        // Initialize AxAI for the specific provider
        // Note: AxAI construction might depend on version-specific registration
        // We assume standard initialization here.
        this.client = new AxAI({
            name: provider as any,
            apiKey,
            config: { model }
        });

        console.log(`LLM Initialized with provider: ${provider}, model: ${model}`);
    }

    async generate(prompt: string, systemPrompt?: string): Promise<string> {
        try {
            const response = await this.client.chat({
                chatPrompt: [
                    ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
                    { role: 'user' as const, content: prompt }
                ]
            });

            if (response instanceof ReadableStream) {
                throw new Error('Streaming not supported in generate()');
            }

            return response.results[0]?.content || '';
        } catch (error) {
            console.error('LLM Generation Error:', error);
            throw error;
        }
    }

    async generateStructured<T>(prompt: string, schema: any, systemPrompt?: string): Promise<T> {
        try {
            const response = await this.client.chat({
                chatPrompt: [
                    ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
                    { role: 'user' as const, content: prompt }
                ],
                responseFormat: {
                    type: 'json_schema',
                    schema
                }
            });

            if (response instanceof ReadableStream) {
                throw new Error('Streaming not supported in generateStructured()');
            }

            const content = response.results[0]?.content;
            if (!content) return {} as T;

            return JSON.parse(content) as T;
        } catch (error) {
            console.error('LLM Structured Generation Error:', error);
            throw error;
        }
    }
}
