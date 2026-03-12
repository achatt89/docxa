import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InterviewEngine } from '../../src/interview/interview-engine.js';
import { AnswerNormalizer } from '../../src/interview/answer-normalizer.js';
import { QuestionStrategy } from '../../src/interview/question-strategy.js';
import { InterviewDefinition } from '../../src/interview/interview-schema.js';

describe('InterviewEngine', () => {
  let engine: InterviewEngine;
  let mockLoader: any;
  let mockStore: any;
  let normalizer: AnswerNormalizer;
  let strategy: QuestionStrategy;

  const mockDefinition: InterviewDefinition = {
    documentId: 'BRD',
    roleId: 'business_stakeholder',
    name: 'Test Interview',
    questions: [
      { id: 'q1', sectionId: 's1', question: 'Q1?', answerType: 'boolean', required: true },
      {
        id: 'q2',
        sectionId: 's2',
        question: 'Q2?',
        answerType: 'long_text',
        required: true,
        dependsOn: ['q1'],
      },
    ],
  };

  beforeEach(() => {
    mockLoader = {
      getByDocumentAndRole: vi.fn().mockResolvedValue(mockDefinition),
    };
    mockStore = {
      saveSession: vi.fn(),
      loadSession: vi.fn(),
      saveNormalizedAnswers: vi.fn(),
    };
    normalizer = new AnswerNormalizer();
    strategy = new QuestionStrategy();
    engine = new InterviewEngine(mockLoader, mockStore, normalizer, strategy, 'mock-dir');
  });

  it('should start a new interview and save it', async () => {
    const session = await engine.startInterview('BRD', 'business_stakeholder', 'Alice');
    expect(session.documentId).toBe('BRD');
    expect(session.roleId).toBe('business_stakeholder');
    expect(session.stakeholderName).toBe('Alice');
    expect(mockStore.saveSession).toHaveBeenCalled();
  });

  it('should register an answer and update session', async () => {
    let session = await engine.startInterview('BRD', 'business_stakeholder');
    session = await engine.registerAnswer(session, 'q1', 'yes');

    expect(session.answers.length).toBe(1);
    expect(session.answers[0].normalizedAnswer).toBe(true);
    expect(mockStore.saveSession).toHaveBeenCalled();
  });

  it('should handle question dependencies', async () => {
    let session = await engine.startInterview('BRD', 'business_stakeholder');

    // q2 depends on q1 being true
    let next = await engine.getNextQuestion(session);
    expect(next?.id).toBe('q1');

    session = await engine.registerAnswer(session, 'q1', 'no');
    next = await engine.getNextQuestion(session);
    expect(next).toBeUndefined(); // q2 skipped because q1 is false
  });
});
