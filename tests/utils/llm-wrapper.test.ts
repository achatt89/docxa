import { describe, it, expect, vi } from 'vitest';
import { LLMWrapper } from '../../src/utils/llm-wrapper.js';

// Mock AxAI and specific clients
vi.mock('@ax-llm/ax', () => {
  const mockAIClass = vi.fn().mockImplementation(() => ({
    chat: vi.fn(),
  }));

  return {
    AxAI: mockAIClass,
    AxAIOpenAI: mockAIClass,
    AxAIAnthropic: mockAIClass,
    AxAIGoogleGemini: mockAIClass,
    AxAIOllama: mockAIClass,
  };
});

import { AxAIOpenAI } from '@ax-llm/ax';

describe('LLMWrapper', () => {
  const config = {
    provider: 'openai' as any,
    model: 'gpt-4o',
    apiKey: 'sk-test',
  };

  it('should call axAI.chat for generate()', async () => {
    const wrapper = new LLMWrapper(config);
    const mockClient = vi.mocked(AxAIOpenAI).mock.results[0].value;

    mockClient.chat.mockResolvedValue({
      results: [{ content: 'Hello World' }],
    });

    const result = await wrapper.generate('Hi');
    expect(result).toBe('Hello World');
    expect(mockClient.chat).toHaveBeenCalledWith({
      chatPrompt: [{ role: 'user', content: 'Hi' }],
      stream: false,
    });
  });

  it('should call axAI.chat with responseFormat for generateStructured()', async () => {
    const wrapper = new LLMWrapper(config);
    const mockClient = vi.mocked(AxAIOpenAI).mock.results[1].value;

    mockClient.chat.mockResolvedValue({
      results: [{ content: '{"foo": "bar"}' }],
    });

    const schema = { type: 'object' };
    const result = await wrapper.generateStructured<any>('Structured', schema);

    expect(result).toEqual({ foo: 'bar' });
    expect(mockClient.chat).toHaveBeenCalledWith({
      chatPrompt: [{ role: 'user', content: 'Structured' }],
      responseFormat: {
        type: 'json_schema',
        schema,
      },
      stream: false,
    });
  });
});
