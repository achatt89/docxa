import { describe, it, expect, vi } from 'vitest';
import { DocumentGenerator } from '../../src/generation/document-generator.js';
import { TemplateSystem } from '../../src/generation/template-system.js';
import { LLMWrapper } from '../../src/utils/llm-wrapper.js';
import { WorkspaceStore } from '../../src/storage/workspace-store.js';

describe('DocumentGenerator', () => {
    it('should parse markdown headers into sections correctly', async () => {
        const mockLlm = {
            generate: vi.fn().mockResolvedValue(`## Executive Summary
This is the summary content.

## Business Objectives
- Objective 1
- Objective 2`)
        } as unknown as LLMWrapper;

        const templateSystem = new TemplateSystem();
        templateSystem.register({
            documentId: 'BRD',
            name: 'Business Requirements Document',
            version: '1.0.0',
            sections: [
                { id: 'exec', title: 'Executive Summary', purpose: 'Summary' },
                { id: 'obj', title: 'Business Objectives', purpose: 'Goals' }
            ],
            dependencies: [],
            validationRules: []
        });

        const store = {} as WorkspaceStore;
        const generator = new DocumentGenerator(mockLlm, templateSystem, store);

        const doc = await generator.generate('BRD', { projectName: 'Test', interviewSummaries: '' });

        expect(doc.sections.length).toBe(2);
        expect(doc.sections[0].title).toBe('Executive Summary');
        expect(doc.sections[0].content).toBe('This is the summary content.');
        expect(doc.sections[1].title).toBe('Business Objectives');
        expect(doc.sections[1].content).toBe('- Objective 1\n- Objective 2');
    });
});
