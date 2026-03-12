import { LLMWrapper } from '../utils/llm-wrapper.js';
import { StakeholderRole } from '../models/stakeholder-model.js';

export interface QuestionSet {
    role: StakeholderRole;
    questions: string[];
}

export class RoleQuestionEngine {
    private llm: LLMWrapper;

    constructor(llm: LLMWrapper) {
        this.llm = llm;
    }

    async generateQuestions(role: StakeholderRole, projectContext: string): Promise<string[]> {
        const prompt = `
Generate 5-7 targeted discovery questions for a ${role} stakeholder in a new software project.
Project Context: ${projectContext}

The questions should help extract requirements for:
- Business goals (if PM)
- Technical constraints (if Architect)
- Functional behaviors (if Developer/QA)

Format: A simple list of questions, one per line.
`;

        const response = await this.llm.generate(prompt, "You are an expert requirements engineer.");

        return response
            .split('\n')
            .map(q => q.trim())
            .filter(q => q.length > 0 && (q.startsWith('-') || q.match(/^\d\./)))
            .map(q => q.replace(/^[-\d.]+\s*/, ''));
    }
}
