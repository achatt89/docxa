import { describe, it, expect } from 'vitest';
import { GenerationPlanner } from '../../src/generation/generation-planner.js';
import { InterviewSession } from '../../src/interview/interview-schema.js';

describe('GenerationPlanner', () => {
  const planner = new GenerationPlanner();

  it('should block PRD generation if business_context is missing and mode is strict', () => {
    const report = planner.plan('PRD', [], [], 'strict');
    expect(report.status).toBe('blocked');
    expect(report.hardDependenciesSatisfied).toBe(false);
    expect(report.missingRequiredEvidence).toContain('business_context');
    expect(report.suggestions.length).toBeGreaterThan(0);
  });

  it('should allow PRD generation if business_context is missing but mode is flexible', () => {
    const report = planner.plan('PRD', [], [], 'flexible');
    expect(report.status).toBe('partial_ready');
    expect(report.hardDependenciesSatisfied).toBe(false);
    expect(report.warnings.some((w) => w.includes('business_context'))).toBe(true);
  });

  it('should satisfy business_context if a completed business_stakeholder interview session exists', () => {
    const mockSessions: InterviewSession[] = [
      {
        sessionId: 's1',
        documentId: 'BRD',
        roleId: 'business_stakeholder',
        status: 'completed',
        startedAt: '',
        updatedAt: '',
        answers: [],
      },
    ];

    const report = planner.plan('PRD', [], mockSessions, 'strict');
    // PRD requires business_context AND product_context
    expect(report.missingRequiredEvidence).not.toContain('business_context');
    expect(report.missingRequiredEvidence).toContain('product_context');
    expect(report.alternativeEvidenceUsed.some((e) => e.includes('business_context'))).toBe(true);
  });

  it('should suggest roles and documents for missing evidence', () => {
    const report = planner.plan('HLD', [], [], 'strict');
    expect(report.suggestions.some((s) => s.includes('solution_architect'))).toBe(true);
    expect(report.suggestions.some((s) => s.includes('Generate TRD first'))).toBe(true);
  });
});
