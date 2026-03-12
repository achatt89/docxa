import path from 'path';
import { TemplateSystem } from './template-system.js';
import { TemplateLoader } from './template-loader.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class TemplateBootstrap {
  static async initialize(templateSystem: TemplateSystem): Promise<void> {
    const loader = new TemplateLoader();

    // 1. Primary and official source: templates/documents/
    const officialTemplateDir = path.resolve(process.cwd(), 'templates', 'documents');

    // 2. Legacy support: src/templates (internal)
    const legacySrcTemplateDir = path.resolve(__dirname, '..', 'templates');

    console.log(`🚀 Initializing templates...`);

    // Load from official source
    const officialTemplates = await loader.loadTemplates(officialTemplateDir);
    templateSystem.registerMany(officialTemplates);

    // Load from legacy src/templates if it exists and contains templates (internal developer support)
    try {
      const srcTemplates = await loader.loadTemplates(legacySrcTemplateDir);
      if (srcTemplates.length > 0) {
        console.warn(
          `⚠️  Warning: Loading templates from legacy internal directory: ${legacySrcTemplateDir}. Please move templates to templates/documents/`,
        );
        templateSystem.registerMany(srcTemplates);
      }
    } catch {
      // Ignore if internal dir is missing
    }

    console.log(`✅ Loaded ${templateSystem.listTemplates().length} templates.`);
  }
}
