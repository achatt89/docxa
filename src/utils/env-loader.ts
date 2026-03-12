import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

export interface EnvLoadResult {
  loadedFile?: string;
  filesAttempted: string[];
}

/**
 * Loads environment variables with the following priority:
 * 1. explicitly provided env file path
 * 2. process.env (already set by shell/runtime)
 * 3. .env.local in the current project root
 * 4. .env in the current project root
 */
export function loadEnv(customPath?: string): EnvLoadResult {
  const result: EnvLoadResult = {
    filesAttempted: [],
  };

  const cwd = process.cwd();

  // 1. Explicit path
  if (customPath) {
    const fullPath = path.resolve(customPath);
    result.filesAttempted.push(fullPath);
    if (fs.existsSync(fullPath)) {
      dotenv.config({ path: fullPath });
      result.loadedFile = fullPath;
      return result;
    } else {
      throw new Error(`Environment file not found at: ${fullPath}`);
    }
  }

  // 2. Already set process.env is handled by dotenv by default (it won't overwrite)

  // 3. .env.local
  const envLocal = path.join(cwd, '.env.local');
  result.filesAttempted.push(envLocal);
  if (fs.existsSync(envLocal)) {
    dotenv.config({ path: envLocal });
    result.loadedFile = envLocal;
    return result;
  }

  // 4. .env
  const envRoot = path.join(cwd, '.env');
  result.filesAttempted.push(envRoot);
  if (fs.existsSync(envRoot)) {
    dotenv.config({ path: envRoot });
    result.loadedFile = envRoot;
    return result;
  }

  return result;
}
