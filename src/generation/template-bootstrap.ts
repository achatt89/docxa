import path from 'path';
import { TemplateSystem } from './template-system.js';
import { TemplateLoader } from './template-loader.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { getDocumentTemplateDirs } from '../runtime/runtime-paths.js';

export class TemplateBootstrap {
  static async initialize(templateSystem: TemplateSystem, cwd: string): Promise<void> {
    const loader = new TemplateLoader();

    // __dirname is either src/generation or dist/generation, so ../../ goes to package root
    const packageRoot = path.resolve(__dirname, '..', '..');
    const { customDir, packageDir } = getDocumentTemplateDirs(cwd, packageRoot);

    console.log(`🚀 Initializing templates...`);

    // Load from custom source if it exists
    try {
      const customTemplates = await loader.loadTemplates(customDir);
      if (customTemplates.length > 0) {
        templateSystem.registerMany(customTemplates);
      }
    } catch {
      // Ignore if user doesn't have custom templates
    }

    // Load from package source
    try {
      const packageTemplates = await loader.loadTemplates(packageDir);
      templateSystem.registerMany(packageTemplates);
    } catch (_e) {
      console.warn(`⚠️  Warning: Failed to load built-in templates from ${packageDir}`);
    }

    console.log(`✅ Loaded ${templateSystem.listTemplates().length} templates.`);
  }
}
