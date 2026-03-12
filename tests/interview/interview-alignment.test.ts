import { describe, it, expect, beforeEach } from 'vitest';
import { InterviewTemplateAlignment } from '../../src/interview/interview-template-alignment.js';
import { InterviewDefinition } from '../../src/interview/interview-schema.js';
import { DocumentTemplate } from '../../src/generation/template-schema.js';

describe('InterviewTemplateAlignment', () => {
  let mockTemplate: DocumentTemplate;

  beforeEach(() => {
    mockTemplate = {
      documentId: 'PRD',
      name: 'Product Requirements Document',
      phase: 1,
      version: '1.0',
      sections: [
        { id: 'overview', title: 'Overview', purpose: 'test' },
        { id: 'features', title: 'Features', purpose: 'test' },
      ],
      dependencies: [],
      promptHints: { systemIntent: 'test', rules: [] },
    } as any;
  });

  it('should pass for valid section IDs', () => {
    const interview: InterviewDefinition = {
      documentId: 'PRD',
      roleId: 'pm',
      name: 'PM Interview',
      purpose: 'test',
      questions: [
        {
          id: 'q1',
          sectionId: 'overview',
          question: 'Q1',
          answerType: 'long_text',
          required: true,
        },
        { id: 'q2', sectionId: 'features', question: 'Q2', answerType: 'list', required: true },
      ],
    };

    expect(() => InterviewTemplateAlignment.validate(interview, mockTemplate)).not.toThrow();
  });

  it('should throw error for invalid section IDs', () => {
    const interview: InterviewDefinition = {
      documentId: 'PRD',
      roleId: 'pm',
      name: 'PM Interview',
      purpose: 'test',
      questions: [
        {
          id: 'q1',
          sectionId: 'invalid_section',
          question: 'Q1',
          answerType: 'long_text',
          required: true,
        },
      ],
    };

    expect(() => InterviewTemplateAlignment.validate(interview, mockTemplate)).toThrow(
      /do not exist in the PRD template: invalid_section/,
    );
  });

  it('should show all invalid section IDs and valid ones in error message', () => {
    const interview: InterviewDefinition = {
      documentId: 'PRD',
      roleId: 'pm',
      name: 'PM Interview',
      purpose: 'test',
      questions: [
        { id: 'q1', sectionId: 'bad1', question: 'Q1', answerType: 'long_text', required: true },
        { id: 'q2', sectionId: 'bad2', question: 'Q2', answerType: 'list', required: true },
      ],
    };

    expect(() => InterviewTemplateAlignment.validate(interview, mockTemplate)).toThrow(
      /bad1, bad2/,
    );
    expect(() => InterviewTemplateAlignment.validate(interview, mockTemplate)).toThrow(
      /Valid sectionIds for PRD are: overview, features/,
    );
  });
});
