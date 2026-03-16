import { AxAI, AxAIOpenAI, AxAIAnthropic, AxAIGoogleGemini, AxAIOllama } from '@ax-llm/ax';
import { LLMConfig } from '../llm/llm-config.js';

export class LLMWrapper {
  // Use 'any' here since the specific AI classes (AxAIOpenAI, AxAIAnthropic)
  // don't perfectly overlap with the generic AxAI class type signature.
  private client: any;

  constructor(config: LLMConfig) {
    const { provider, model, apiKey } = config;

    switch (provider) {
      case 'openai':
        this.client = new AxAIOpenAI({
          apiKey,
          config: { model: model as any },
        });
        break;
      case 'anthropic':
        this.client = new AxAIAnthropic({
          apiKey,
          config: { model: model as any },
        });
        break;
      case 'google-gemini':
        this.client = new AxAIGoogleGemini({
          apiKey,
          config: { model: model as any },
        });
        break;
      case 'ollama':
        this.client = new AxAIOllama({
          apiKey: apiKey || '', // Satisfy interface even if not used
          apiURL: process.env.DOCXA_OLLAMA_URL || 'http://localhost:11434/v1',
          config: { model: model as any },
        });
        break;
      default:
        // Fallback for any unknown variants
        this.client = new AxAI({
          name: provider as any,
          apiKey,
          config: { model },
        });
    }

    console.log(`LLM Initialized with provider: ${provider}, model: ${model}`);
  }

  async generate(prompt: string, systemPrompt?: string): Promise<string> {
    try {
      const response = await this.client.chat({
        chatPrompt: [
          ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
          { role: 'user' as const, content: prompt },
        ],
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
          { role: 'user' as const, content: prompt },
        ],
        responseFormat: {
          type: 'json_schema',
          schema,
        },
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
