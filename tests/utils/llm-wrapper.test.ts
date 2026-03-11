import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LLMWrapper } from '../../src/utils/llm-wrapper.js';

// Mock AxAI
vi.mock('@ax-llm/ax', () => {
    return {
        AxAI: vi.fn().mockImplementation(() => {
            return {
                chat: vi.fn()
            };
        })
    };
});

import { AxAI } from '@ax-llm/ax';

describe('LLMWrapper', () => {
    const config = {
        provider: 'openai' as any,
        model: 'gpt-4o',
        apiKey: 'sk-test'
    };

    it('should call axAI.chat for generate()', async () => {
        const wrapper = new LLMWrapper(config);
        const mockClient = vi.mocked(AxAI).mock.results[0].value;

        mockClient.chat.mockResolvedValue({
            results: [{ content: 'Hello World' }]
        });

        const result = await wrapper.generate('Hi');
        expect(result).toBe('Hello World');
        expect(mockClient.chat).toHaveBeenCalledWith({
            chatPrompt: [{ role: 'user', content: 'Hi' }]
        });
    });

    it('should call axAI.chat with responseFormat for generateStructured()', async () => {
        const wrapper = new LLMWrapper(config);
        const mockClient = vi.mocked(AxAI).mock.results[1].value;

        mockClient.chat.mockResolvedValue({
            results: [{ content: '{"foo": "bar"}' }]
        });

        const schema = { type: 'object' };
        const result = await wrapper.generateStructured<any>('Structured', schema);

        expect(result).toEqual({ foo: 'bar' });
        expect(mockClient.chat).toHaveBeenCalledWith({
            chatPrompt: [{ role: 'user', content: 'Structured' }],
            responseFormat: {
                type: 'json_schema',
                schema
            }
        });
    });
});
