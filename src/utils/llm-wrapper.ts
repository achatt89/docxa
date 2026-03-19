import { AxAI, AxAIOpenAI, AxAIAnthropic, AxAIGoogleGemini, AxAIOllama } from '@ax-llm/ax';
import { LLMConfig, LLMRuntimeError } from '../llm/llm-config.js';

export class LLMWrapper {
  // Use 'any' here since the specific AI classes (AxAIOpenAI, AxAIAnthropic)
  // don't perfectly overlap with the generic AxAI class type signature.
  private client: any;
  private readonly config: LLMConfig;

  constructor(config: LLMConfig) {
    const { provider, model, apiKey } = config;
    this.config = config;

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
      case 'azure-openai':
        this.client = undefined;
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
      if (this.config.provider === 'azure-openai') {
        return await this.generateWithAzure(prompt, systemPrompt);
      }

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
      if (this.config.provider === 'azure-openai') {
        const responseText = await this.generateWithAzure(prompt, systemPrompt, schema);
        return JSON.parse(responseText) as T;
      }

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

  private async generateWithAzure(prompt: string, systemPrompt?: string, schema?: any): Promise<string> {
    const model = this.config.model;
    const messages = [
      ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
      { role: 'user', content: prompt },
    ];

    const body: Record<string, unknown> = {
      messages,
      stream: false,
      model,
    };

    if (schema) {
      body.response_format = {
        type: 'json_schema',
        json_schema: {
          name: 'docxa_structured_response',
          schema,
          strict: true,
        },
      };
    }

    if (this.isReasoningModel(model)) {
      body.max_completion_tokens = schema ? 4096 : 2048;
      body.reasoning_effort = 'minimal';
    } else {
      body.temperature = 0;
    }

    const response = await fetch(this.getAzureChatUrl(), {
      method: 'POST',
      headers: this.getAzureHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Azure OpenAI request failed (${response.status}): ${errorText}`);
    }

    const payload = await response.json();
    return payload.choices?.[0]?.message?.content || '';
  }

  private getAzureHeaders(): HeadersInit {
    if (this.config.apiMode === 'legacy') {
      return {
        'Content-Type': 'application/json',
        'api-key': this.config.apiKey,
      };
    }

    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.config.apiKey}`,
    };
  }

  private getAzureChatUrl(): string {
    const endpoint = this.ensureTrailingSlash(this.config.endpoint || '');

    if (this.config.apiMode === 'legacy') {
      return `${endpoint}openai/deployments/${this.config.deploymentName}/chat/completions?api-version=${this.config.apiVersion || '2024-10-21'}`;
    }

    return `${endpoint}openai/v1/chat/completions`;
  }

  private ensureTrailingSlash(value: string): string {
    return value.endsWith('/') ? value : `${value}/`;
  }

  private isReasoningModel(model: string): boolean {
    return /^gpt-5|^o[134]/i.test(model);
  }
}
