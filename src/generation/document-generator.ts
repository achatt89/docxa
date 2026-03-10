import { LLMWrapper } from '../utils/llm-wrapper.js';
import { TemplateSystem, DocumentTemplate } from './template-system.js';
import { Document, DocumentType, DocumentSection } from '../models/document-model.js';
import { WorkspaceStore } from '../storage/workspace-store.js';

export class DocumentGenerator {
    private llm: LLMWrapper;
    private templateSystem: TemplateSystem;
    private store: WorkspaceStore;

    constructor(llm: LLMWrapper, templateSystem: TemplateSystem, store: WorkspaceStore) {
        this.llm = llm;
        this.templateSystem = templateSystem;
        this.store = store;
    }

    async generate(type: DocumentType, context: any): Promise<Document> {
        const template = this.templateSystem.getTemplate(type);
        if (!template) throw new Error(`Template for ${type} not found`);

        // Check dependencies
        for (const dep of template.dependencies) {
            // In a real system, we'd check if dep exists in workspace
        }

        const filledPrompt = this.fillTemplate(template.prompt, {
            ...context,
            sections: template.sections.join('\n- ')
        });

        const content = await this.llm.generate(filledPrompt, `You are a high-level technical writer generating a ${type} document.`);

        // Simplistic section parsing for now - in production use structured LLM output
        const sections: DocumentSection[] = template.sections.map(title => ({
            id: crypto.randomUUID(),
            title,
            content: `Content for ${title}...`, // Real implementation would parse 'content'
            provenance: {
                source: 'generated',
                timestamp: new Date().toISOString(),
                reasoning: 'Generated from stakeholder interviews and project context.'
            }
        }));

        return {
            type,
            version: '1.0.0',
            status: 'draft',
            sections,
            dependencies: template.dependencies,
            metadata: {},
            lastUpdated: new Date().toISOString(),
        };
    }

    private fillTemplate(template: string, data: any): string {
        let result = template;
        for (const key in data) {
            result = result.replace(new RegExp(`{{${key}}}`, 'g'), data[key]);
        }
        return result;
    }
}
