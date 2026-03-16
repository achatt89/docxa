import path from 'path';
import fs from 'fs/promises';

/**
 * Resolves the canonical directories for document templates.
 * Returns both the custom workspace dir (for overrides) and the package defaults.
 */
export function getDocumentTemplateDirs(
  cwd: string,
  packageRoot: string,
): { customDir: string; packageDir: string } {
  return {
    customDir: path.resolve(cwd, 'templates', 'documents'),
    packageDir: path.resolve(packageRoot, 'templates', 'documents'),
  };
}

/**
 * Resolves the canonical directory for interview templates.
 * Incorporates legacy path detection logic previously held in the CLI.
 */
export async function resolveInterviewTemplateDir(cwd: string): Promise<string> {
  const interviewDir = path.join(cwd, 'templates', 'interviews');
  const legacyInterviewDir = path.join(cwd, 'interviews');

  try {
    const officialEntries = await fs.readdir(interviewDir);
    if (officialEntries.length === 0) {
      const legacyEntries = await fs.readdir(legacyInterviewDir);
      if (legacyEntries.length > 0) {
        console.warn(
          `⚠️  Warning: Using legacy interview directory: ${legacyInterviewDir}. Please move interview definitions to templates/interviews/`,
        );
        return legacyInterviewDir;
      }
    }
  } catch {
    try {
      const legacyEntries = await fs.readdir(legacyInterviewDir);
      if (legacyEntries.length > 0) {
        console.warn(
          `⚠️  Warning: Using legacy interview directory: ${legacyInterviewDir}. Please move interview definitions to templates/interviews/`,
        );
        return legacyInterviewDir;
      }
    } catch {
      // Neither exists, loaders downstream will handle it
    }
  }

  return interviewDir;
}
