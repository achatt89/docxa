import path from 'path';
import { TemplateSystem } from './template-system.js';
import { TemplateLoader } from './template-loader.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class TemplateBootstrap {
  static async initialize(templateSystem: TemplateSystem): Promise<void> {
    const loader = new TemplateLoader();

    // 1. Custom/local templates (if user provides them in their cwd)
    const customTemplateDir = path.resolve(process.cwd(), 'templates', 'documents');

    // 2. Built-in templates (bundled with the package)
    // __dirname is either src/generation or dist/generation, so ../../ goes to package root
    const packageTemplateDir = path.resolve(__dirname, '..', '..', 'templates', 'documents');

    console.log(`🚀 Initializing templates...`);

    // Load from custom source if it exists
    try {
      const customTemplates = await loader.loadTemplates(customTemplateDir);
      if (customTemplates.length > 0) {
        templateSystem.registerMany(customTemplates);
      }
    } catch {
      // Ignore if user doesn't have custom templates
    }

    // Load from package source
    try {
      const packageTemplates = await loader.loadTemplates(packageTemplateDir);
      templateSystem.registerMany(packageTemplates);
    } catch (_e) {
      console.warn(`⚠️  Warning: Failed to load built-in templates from ${packageTemplateDir}`);
    }

    console.log(`✅ Loaded ${templateSystem.listTemplates().length} templates.`);
  }
}
