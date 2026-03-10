import { describe, it, expect } from 'vitest';
import { InterviewLoader } from '../../src/interview/interview-loader.js';
import { TemplateSystem } from '../../src/generation/template-system.js';
import { TemplateLoader } from '../../src/generation/template-loader.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Interview-Template Integration', () => {
    const templateDir = path.resolve(__dirname, '../../src/templates');
    const interviewDir = path.resolve(__dirname, '../../interviews/phase1');

    it('should validate all phase 1 interviews against real templates', async () => {
        const templateLoader = new TemplateLoader();
        const templates = await templateLoader.loadTemplates(templateDir);
        const templateSystem = new TemplateSystem();
        templateSystem.registerMany(templates);

        const interviewLoader = new InterviewLoader(templateSystem);
        const interviews = await interviewLoader.loadInterviews(interviewDir);

        expect(interviews.length).toBeGreaterThanOrEqual(4);

        // If they loaded without throwing, it means they passed alignment validation
        // since we integrated it into recursiveLoad.
        const prd = interviews.find(i => i.documentId === 'PRD');
        const hld = interviews.find(i => i.documentId === 'HLD');
        const lld = interviews.find(i => i.documentId === 'LLD');
        const nfr = interviews.find(i => i.documentId === 'NFR');

        expect(prd).toBeDefined();
        expect(hld).toBeDefined();
        expect(lld).toBeDefined();
        expect(nfr).toBeDefined();
    });
});
