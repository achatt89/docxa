import { AxAI, AxAIOpenAI, AxAIAnthropic, AxAIGoogleGemini, AxAIOllama } from '@ax-llm/ax';
import { LLMConfig, LLMRuntimeError } from '../llm/llm-config.js';

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
          config: { model: model as any, stream: false },
        });
        break;
      case 'anthropic':
        this.client = new AxAIAnthropic({
          apiKey,
          config: { model: model as any, stream: false },
        });
        break;
      case 'google-gemini':
        this.client = new AxAIGoogleGemini({
          apiKey,
          config: { model: model as any, stream: false },
        });
        break;
      case 'ollama':
        this.client = new AxAIOllama({
          apiKey: apiKey || '', // Satisfy interface even if not used
          apiURL: process.env.DOCXA_OLLAMA_URL || 'http://localhost:11434/v1',
          config: { model: model as any, stream: false },
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

    const modelName = model || 'unknown';
    console.log(`LLM Initialized with provider: ${provider}, model: ${modelName}`);
  }

  async generate(prompt: string, systemPrompt?: string): Promise<string> {
    try {
      const response = await this.client.chat({
        chatPrompt: [
          ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
          { role: 'user' as const, content: prompt },
        ],
        stream: false,
      });

      const isStream =
        response &&
        (response.constructor?.name === 'ReadableStream' ||
          (typeof ReadableStream !== 'undefined' && response instanceof ReadableStream) ||
          (response as any).stream);

      if (isStream) {
        throw new Error('Streaming response received despite being disabled in configuration.');
      }

      const content = response.results?.[0]?.content || (response as any).content || '';
      return content;
    } catch (error: any) {
      const msg = error.message || 'Unknown error during generation';
      const model = this.client?.config?.model || 'unknown';
      if (
        msg.includes('404') ||
        msg.includes('model_not_found') ||
        msg.includes('invalid_request_error')
      ) {
        throw new LLMRuntimeError(
          `Model initialization failed. The model "${model}" may be discontinued, invalid, or your API key may not have access to it.`,
          error,
        );
      }
      throw new LLMRuntimeError(`LLM Generation Error: ${msg}`, error);
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
        stream: false,
      });

      if (response instanceof ReadableStream) {
        throw new Error('Streaming not supported in generateStructured()');
      }

      const content = response.results[0]?.content;
      if (!content) return {} as T;

      return JSON.parse(content) as T;
    } catch (error: any) {
      const msg = error.message || 'Unknown error during structured generation';
      if (
        msg.includes('404') ||
        msg.includes('model_not_found') ||
        msg.includes('invalid_request_error')
      ) {
        throw new LLMRuntimeError(
          `Model initialization failed. The model "${this.client.config?.model}" may be discontinued, invalid, or your API key may not have access to it.`,
          error,
        );
      }
      throw new LLMRuntimeError(`LLM Structured Generation Error: ${msg}`, error);
    }
  }
}
