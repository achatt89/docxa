import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { resolveLLMConfig } from '../../src/llm/llm-config.js';

describe('LLM Config Resolution', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    // Clear relevant env vars
    delete process.env.DOCXA_PROVIDER;
    delete process.env.DOCXA_MODEL;
    delete process.env.DOCXA_API_KEY;
    delete process.env.OPENAI_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.GEMINI_API_KEY;
    delete process.env.GOOGLE_API_KEY;
    delete process.env.AZURE_OPENAI_API_KEY;
    delete process.env.AZURE_OPENAI_ENDPOINT;
    delete process.env.AZURE_OPENAI_DEPLOYMENT;
    delete process.env.AZURE_OPENAI_API_MODE;
    delete process.env.AZURE_OPENAI_API_VERSION;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should resolve default OpenAI config if keys are present', () => {
    process.env.OPENAI_API_KEY = 'sk-test';
    const config = resolveLLMConfig();
    expect(config.provider).toBe('openai');
    expect(config.model).toBe('gpt-5.4');
    expect(config.apiKey).toBe('sk-test');
  });

  it('should respect DOCXA_PROVIDER and DOCXA_MODEL', () => {
    process.env.DOCXA_PROVIDER = 'anthropic';
    process.env.DOCXA_MODEL = 'claude-2';
    process.env.ANTHROPIC_API_KEY = 'ant-test';

    const config = resolveLLMConfig();
    expect(config.provider).toBe('anthropic');
    expect(config.model).toBe('claude-2');
    expect(config.apiKey).toBe('ant-test');
  });

  it('should throw if provider is unsupported', () => {
    process.env.DOCXA_PROVIDER = 'unknown' as any;
    expect(() => resolveLLMConfig()).toThrow(/Unsupported provider/);
  });

  it('should throw if API key is missing', () => {
    process.env.DOCXA_PROVIDER = 'openai';
    expect(() => resolveLLMConfig()).toThrow(/LLM configuration is required/);
  });

  it('should prioritize DOCXA_API_KEY override', () => {
    process.env.OPENAI_API_KEY = 'sk-wrong';
    process.env.DOCXA_API_KEY = 'sk-right';
    const config = resolveLLMConfig();
    expect(config.apiKey).toBe('sk-right');
  });

  it('should support GOOGLE_API_KEY as fallback for google', () => {
    process.env.DOCXA_PROVIDER = 'google';
    process.env.GOOGLE_API_KEY = 'goo-test';
    const config = resolveLLMConfig();
    expect(config.apiKey).toBe('goo-test');
  });

  it('should resolve Ollama config without API key', () => {
    process.env.DOCXA_PROVIDER = 'ollama';
    const config = resolveLLMConfig();
    expect(config.provider).toBe('ollama');
    expect(config.model).toBe('llama3.1');
    expect(config.apiKey).toBe('');
  });

  it('should resolve Azure OpenAI config', () => {
    process.env.DOCXA_PROVIDER = 'azure-openai';
    process.env.AZURE_OPENAI_API_KEY = 'azure-test';
    process.env.AZURE_OPENAI_ENDPOINT = 'https://example.cognitiveservices.azure.com/';
    process.env.AZURE_OPENAI_DEPLOYMENT = 'gpt-5-mini';

    const config = resolveLLMConfig();
    expect(config.provider).toBe('azure-openai');
    expect(config.apiKey).toBe('azure-test');
    expect(config.endpoint).toBe('https://example.cognitiveservices.azure.com/');
    expect(config.deploymentName).toBe('gpt-5-mini');
    expect(config.model).toBe('gpt-5-mini');
    expect(config.apiMode).toBe('v1');
  });
});
