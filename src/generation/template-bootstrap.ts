import path from 'path';
import { TemplateSystem } from './template-system.js';
import { TemplateLoader } from './template-loader.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class TemplateBootstrap {
    static async initialize(templateSystem: TemplateSystem): Promise<void> {
        const loader = new TemplateLoader();

        // We look in src/templates by default as seen in the repo
        // But we also support templates/ at root if it exists
        const rootTemplateDir = path.resolve(process.cwd(), 'templates');
        const srcTemplateDir = path.resolve(__dirname, '..', 'templates');

        console.log(`🚀 Initializing templates...`);

        // Load from src/templates
        const srcTemplates = await loader.loadTemplates(srcTemplateDir);
        templateSystem.registerMany(srcTemplates);

        // Load from root templates/ if it exists and is different
        if (rootTemplateDir !== srcTemplateDir) {
            const rootTemplates = await loader.loadTemplates(rootTemplateDir);
            templateSystem.registerMany(rootTemplates);
        }

        console.log(`✅ Loaded ${templateSystem.listTemplates().length} templates.`);
    }
}
