import { LLMWrapper } from '../utils/llm-wrapper.js';
import { Stakeholder } from '../models/stakeholder-model.js';

export interface InterviewSession {
  stakeholder: Stakeholder;
  questions: string[];
  answers: Map<string, string>;
  isComplete: boolean;
}

export class ConversationEngine {
  private llm: LLMWrapper;

  constructor(llm: LLMWrapper) {
    this.llm = llm;
  }

  async summarizeInterview(session: InterviewSession): Promise<string> {
    const transcript = Array.from(session.answers.entries())
      .map(([q, a]) => `Q: ${q}\nA: ${a}`)
      .join('\n\n');

    const prompt = `
Summarize the following interview with a ${session.stakeholder.role} stakeholder.
Extract key requirements, constraints, and confirmed features.

Transcript:
${transcript}
`;

    return this.llm.generate(prompt, 'You are an expert analyst.');
  }

  // CLI will handle the actual I/O loop using this session state
  startSession(stakeholder: Stakeholder, questions: string[]): InterviewSession {
    return {
      stakeholder,
      questions,
      answers: new Map(),
      isComplete: false,
    };
  }
}
