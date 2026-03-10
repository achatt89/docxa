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

        // 3. Root templates/ (backward compatibility)
        const legacyRootTemplateDir = path.resolve(process.cwd(), 'templates');

        console.log(`🚀 Initializing templates...`);

        // Load from official source
        const officialTemplates = await loader.loadTemplates(officialTemplateDir);
        templateSystem.registerMany(officialTemplates);

        // Load from legacy src/templates if it exists and contains templates (internal developer support)
        try {
            const srcTemplates = await loader.loadTemplates(legacySrcTemplateDir);
            if (srcTemplates.length > 0) {
                console.warn(`⚠️  Warning: Loading templates from legacy internal directory: ${legacySrcTemplateDir}. Please move templates to templates/documents/`);
                templateSystem.registerMany(srcTemplates);
            }
        } catch (e) {
            // Ignore if internal dir is missing
        }

        // Load from legacy root templates/ (if they were directly in templates/ instead of templates/documents/)
        if (legacyRootTemplateDir !== officialTemplateDir) {
            try {
                const rootTemplates = await loader.loadTemplates(legacyRootTemplateDir);
                if (rootTemplates.length > 0) {
                    console.warn(`⚠️  Warning: Loading templates from legacy root directory: ${legacyRootTemplateDir}. Please move templates to templates/documents/`);
                    templateSystem.registerMany(rootTemplates);
                }
            } catch (e) {
                // Ignore
            }
        }

        console.log(`✅ Loaded ${templateSystem.listTemplates().length} templates.`);
    }
}
