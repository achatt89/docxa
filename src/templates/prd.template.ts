import { DocumentTemplate } from '../src/generation/template-system.js';

export const PRDTemplate: DocumentTemplate = {
    type: 'PRD',
    dependencies: ['BRD'],
    sections: [
        'Product Vision',
        'Target Audience',
        'User Stories',
        'Functional Requirements',
        'Non-Functional Requirements',
        'User Flow',
        'Roadmap'
    ],
    prompt: `
Generate a Product Requirements Document (PRD) based on the BRD and stakeholder inputs.
BRD Content:
{{brdContent}}

Stakeholder Inputs:
{{interviewSummaries}}

Format as Markdown with these sections:
{{sections}}
`
};
