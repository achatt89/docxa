import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loadEnv } from '../../src/utils/env-loader.js';
import fs from 'fs';
import path from 'path';

describe('Env Loader', () => {
  const testEnvFile = path.resolve('.env.test-manual');

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    if (fs.existsSync(testEnvFile)) {
      fs.unlinkSync(testEnvFile);
    }
    // Clean up generic .env and .env.local if tests created them
  });

  it('should throw error if custom path is provided but does not exist', () => {
    expect(() => loadEnv({ cwd: process.cwd(), envFile: '/non/existent/path' })).toThrow(
      /Environment file not found/,
    );
  });

  it('should load environment from custom path if it exists', () => {
    fs.writeFileSync(testEnvFile, 'CUSTOM_VAR=hello');
    const result = loadEnv({ cwd: process.cwd(), envFile: testEnvFile });
    expect(result.loadedFile).toBe(testEnvFile);
    expect(process.env.CUSTOM_VAR).toBe('hello');
    delete process.env.CUSTOM_VAR;
  });

  it('should return attempted files even if none found', () => {
    const result = loadEnv({ cwd: process.cwd() });
    expect(result.loadedFile).toBeUndefined();
    expect(result.filesAttempted.length).toBeGreaterThanOrEqual(2); // .env.local, .env
  });
});
