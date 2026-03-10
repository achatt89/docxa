import { DocumentType } from '../models/document-model.js';

export interface DocumentTemplate {
    type: DocumentType;
    sections: string[];
    prompt: string;
    schema?: any;
    dependencies: DocumentType[];
}

export class TemplateSystem {
    private templates: Map<DocumentType, DocumentTemplate> = new Map();

    register(template: DocumentTemplate) {
        this.templates.set(template.type, template);
    }

    getTemplate(type: DocumentType): DocumentTemplate | undefined {
        return this.templates.get(type);
    }

    getDependencies(type: DocumentType): DocumentType[] {
        const template = this.getTemplate(type);
        return template?.dependencies || [];
    }
}
