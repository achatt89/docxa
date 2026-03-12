import { InterviewSession, InterviewQuestion, InterviewAnswer } from './interview-schema.js';
import { InterviewLoader } from './interview-loader.js';
import { InterviewSessionStore } from './interview-session-store.js';
import { AnswerNormalizer } from './answer-normalizer.js';
import { QuestionStrategy } from './question-strategy.js';
import { v4 as uuidv4 } from 'uuid';

export class InterviewEngine {
  constructor(
    private loader: InterviewLoader,
    private store: InterviewSessionStore,
    private normalizer: AnswerNormalizer,
    private strategy: QuestionStrategy,
    private interviewDir: string,
  ) {}

  async startInterview(
    documentId: string,
    roleId: string,
    stakeholderName?: string,
  ): Promise<InterviewSession> {
    const definition = await this.loader.getByDocumentAndRole(
      this.interviewDir,
      documentId,
      roleId,
    );
    if (!definition) {
      throw new Error(
        `No interview definition found for document ${documentId} and role ${roleId}`,
      );
    }

    const session: InterviewSession = {
      sessionId: uuidv4(),
      documentId: documentId.toUpperCase(),
      roleId,
      stakeholderName,
      status: 'in_progress',
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      answers: [],
    };

    await this.store.saveSession(session);
    return session;
  }

  async resumeSession(sessionId: string): Promise<InterviewSession | undefined> {
    const session = await this.store.loadSession(sessionId);
    if (session && session.status === 'completed') {
      // Allow viewing completed sessions, but maybe not resumed?
      // For now, just return.
    }
    return session;
  }

  async getNextQuestion(session: InterviewSession): Promise<InterviewQuestion | undefined> {
    const definition = await this.loader.getByDocumentAndRole(
      this.interviewDir,
      session.documentId,
      session.roleId,
    );
    if (!definition) return undefined;

    return this.strategy.getNextQuestion(definition, session);
  }

  async registerAnswer(
    session: InterviewSession,
    questionId: string,
    rawAnswer: any,
  ): Promise<InterviewSession> {
    const definition = await this.loader.getByDocumentAndRole(
      this.interviewDir,
      session.documentId,
      session.roleId,
    );
    if (!definition) throw new Error('Interview definition lost');

    const question = definition.questions.find((q) => q.id === questionId);
    if (!question) throw new Error(`Question ${questionId} not found in definition`);

    const normalized = this.normalizer.normalize(question, rawAnswer);

    const answer: InterviewAnswer = {
      questionId,
      rawAnswer,
      normalizedAnswer: normalized,
      confidence: 1.0, // Stakeholder direct answer is high confidence
      provenance: {
        source: 'stakeholder',
        timestamp: new Date().toISOString(),
      },
    };

    // Update existing or add new
    const existingIndex = session.answers.findIndex((a) => a.questionId === questionId);
    if (existingIndex >= 0) {
      session.answers[existingIndex] = answer;
    } else {
      session.answers.push(answer);
    }

    session.updatedAt = new Date().toISOString();

    // Check if complete
    const next = this.strategy.getNextQuestion(definition, session);
    if (!next) {
      session.status = 'completed';
      await this.finalizeSession(session);
    } else {
      await this.store.saveSession(session);
    }

    return session;
  }

  private async finalizeSession(session: InterviewSession): Promise<void> {
    const normalizedMap: Record<string, any> = {};
    for (const answer of session.answers) {
      if (answer.normalizedAnswer !== undefined) {
        normalizedMap[answer.questionId] = answer.normalizedAnswer;
      }
    }

    await this.store.saveNormalizedAnswers(session.sessionId, normalizedMap);
    await this.store.saveSession(session);
  }
}
