import { DocumentTemplate } from '../src/generation/template-system.js';

export const BRDTemplate: DocumentTemplate = {
    type: 'BRD',
    dependencies: [],
    sections: [
        'Executive Summary',
        'Business Objectives',
        'Stakeholders',
        'High Level Requirements',
        'Business Process',
        'Success Criteria'
    ],
    prompt: `
Generate a Business Requirements Document (BRD) based on the following interview summaries and project context.
Project Name: {{projectName}}
Interview Summaries:
{{interviewSummaries}}

The document should be formatted in Markdown and include the following sections:
{{sections}}
`
};
