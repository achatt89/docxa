import { describe, it, expect, vi } from 'vitest';
import { TemplateLoader } from '../../src/generation/template-loader.js';
import path from 'path';
import fs from 'fs/promises';

describe('TemplateLoader', () => {
    it('should load and validate all JSON templates in src/templates', async () => {
        const loader = new TemplateLoader();
        const templateDir = path.resolve(process.cwd(), 'src/templates');
        const templates = await loader.loadTemplates(templateDir);

        expect(templates.length).toBeGreaterThan(0);
        const brd = templates.find(t => t.documentId === 'BRD');
        expect(brd).toBeDefined();
        expect(brd?.name).toBe('Business Requirements Document');
        expect(brd?.sections.length).toBeGreaterThan(0);
    });

    it('should throw error on invalid template', async () => {
        const loader = new TemplateLoader();
        const mockDir = path.resolve(process.cwd(), 'tests/mock-templates');
        await fs.mkdir(mockDir, { recursive: true });

        const invalidTemplate = {
            documentId: "INVALID",
            // missing name
            sections: []
        };

        await fs.writeFile(path.join(mockDir, 'invalid.json'), JSON.stringify(invalidTemplate));

        await expect(loader.loadTemplates(mockDir)).rejects.toThrow();

        await fs.rm(mockDir, { recursive: true, force: true });
    });
});
