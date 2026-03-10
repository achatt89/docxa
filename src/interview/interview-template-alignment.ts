import { InterviewDefinition } from './interview-schema.js';
import { DocumentTemplate } from '../generation/template-schema.js';

export class InterviewTemplateAlignment {
    static validate(interview: InterviewDefinition, template: DocumentTemplate): void {
        const validSectionIds = new Set(template.sections.map(s => s.id));
        const invalidSections: string[] = [];

        for (const question of interview.questions) {
            if (!validSectionIds.has(question.sectionId)) {
                invalidSections.push(question.sectionId);
            }
        }

        if (invalidSections.length > 0) {
            const uniqueInvalid = Array.from(new Set(invalidSections));
            throw new Error(
                `Interview-Template Misalignment for ${interview.documentId} (${interview.roleId}):\n` +
                `The following sectionIds do not exist in the ${template.documentId} template: ${uniqueInvalid.join(', ')}\n` +
                `Valid sectionIds for ${template.documentId} are: ${Array.from(validSectionIds).join(', ')}`
            );
        }
    }
}
