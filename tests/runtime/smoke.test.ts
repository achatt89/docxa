import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { initializeRuntime } from '../../src/runtime/initialize-runtime.js';
import { loadEnv } from '../../src/utils/env-loader.js';
import fs from 'fs';
import path from 'path';

describe('Docxa Phase 1 Smoke Tests', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    // Clear any existing keys so we test the "no keys" state cleanly
    delete process.env.OPENAI_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.GEMINI_API_KEY;
    delete process.env.DOCXA_API_KEY;
    delete process.env.DOCXA_PROVIDER;
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  describe('Non-LLM paths', () => {
    it('initializes runtime successfully without any API keys', async () => {
      // Act
      const runtime = await initializeRuntime({ cwd: __dirname });

      // Assert
      expect(runtime).toBeDefined();
      expect(runtime.cwd).toBe(__dirname);
      expect(runtime.templateSystem).toBeDefined();
      expect(runtime.store).toBeDefined();

      // getLLM is available but untouched yet
      expect(typeof runtime.getLLM).toBe('function');
    });

    it('does not crash when invoking non-LLM flows (simulated)', async () => {
      const runtime = await initializeRuntime({ cwd: __dirname });

      // "list documents"
      const docs = await runtime.store.listDocuments();
      expect(Array.isArray(docs)).toBe(true);

      // We successfully verified we didn't need an LLM!
    });
  });

  describe('LLM-required paths', () => {
    it('throws clear error when getLLM() is called and config is missing', async () => {
      const runtime = await initializeRuntime({ cwd: __dirname });

      expect(() => runtime.getLLM()).toThrow(/LLM configuration is required for this command/);
    });

    it('resolves config correctly when env vars are present', async () => {
      process.env.OPENAI_API_KEY = 'sk-mock-key';
      const runtime = await initializeRuntime({ cwd: __dirname });

      const llm = runtime.getLLM();
      expect(llm).toBeDefined();
    });
  });

  describe('Shared env loading', () => {
    const mockCwd = path.join(__dirname, 'mock-env');

    beforeEach(() => {
      if (!fs.existsSync(mockCwd)) {
        fs.mkdirSync(mockCwd, { recursive: true });
      }
    });

    afterEach(() => {
      if (fs.existsSync(mockCwd)) {
        fs.rmSync(mockCwd, { recursive: true, force: true });
      }
    });

    it('prefers explicit env file relative to cwd', () => {
      const explicitEnv = path.join(mockCwd, 'custom.env');
      fs.writeFileSync(explicitEnv, 'CUSTOM_VAR=success');

      const result = loadEnv({ cwd: mockCwd, envFile: 'custom.env' });
      expect(result.loadedFile).toBe(explicitEnv);
      expect(process.env.CUSTOM_VAR).toBe('success');
    });

    it('falls back to .env.local then .env in cwd', () => {
      const localEnv = path.join(mockCwd, '.env.local');
      fs.writeFileSync(localEnv, 'LOCAL_VAR=success');

      const result = loadEnv({ cwd: mockCwd });
      expect(result.loadedFile).toBe(localEnv);
      expect(process.env.LOCAL_VAR).toBe('success');
    });
  });
});
