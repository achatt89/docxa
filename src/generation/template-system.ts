import { DocumentTemplate } from './template-schema.js';

export class TemplateSystem {
    private templates: Map<string, DocumentTemplate> = new Map();

    register(template: DocumentTemplate) {
        this.templates.set(template.documentId.toUpperCase(), template);
    }

    registerMany(templates: DocumentTemplate[]) {
        for (const template of templates) {
            this.register(template);
        }
    }

    getTemplate(documentId: string): DocumentTemplate | undefined {
        return this.templates.get(documentId.toUpperCase());
    }

    getDependencies(documentId: string): string[] {
        const template = this.getTemplate(documentId);
        return template?.dependencies || [];
    }

    listTemplates(): DocumentTemplate[] {
        return Array.from(this.templates.values());
    }

    getTemplateSectionIds(documentId: string): string[] {
        const template = this.getTemplate(documentId);
        return template?.sections.map(s => s.id) || [];
    }
}
