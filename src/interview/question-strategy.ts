import { InterviewDefinition, InterviewQuestion, InterviewSession } from './interview-schema.js';

export class QuestionStrategy {
  getNextQuestion(
    definition: InterviewDefinition,
    session: InterviewSession,
  ): InterviewQuestion | undefined {
    const answeredIds = new Set(session.answers.map((a) => a.questionId));

    for (const question of definition.questions) {
      if (answeredIds.has(question.id)) continue;

      if (this.isDependencySatisfied(question, session)) {
        return question;
      }
    }

    return undefined;
  }

  getRemainingQuestions(
    definition: InterviewDefinition,
    session: InterviewSession,
  ): InterviewQuestion[] {
    const answeredIds = new Set(session.answers.map((a) => a.questionId));
    return definition.questions.filter(
      (q) => !answeredIds.has(q.id) && this.isDependencySatisfied(q, session),
    );
  }

  private isDependencySatisfied(question: InterviewQuestion, session: InterviewSession): boolean {
    if (!question.dependsOn || question.dependsOn.length === 0) return true;

    return question.dependsOn.every((depId) => {
      const answer = session.answers.find((a) => a.questionId === depId);
      if (!answer) return false;

      // For boolean dependencies, check if true. For others, just check presence.
      // In more advanced versions, this could check for specific values.
      if (typeof answer.normalizedAnswer === 'boolean') {
        return answer.normalizedAnswer === true;
      }

      return answer.normalizedAnswer !== undefined && answer.normalizedAnswer !== null;
    });
  }
}
