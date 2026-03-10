import { describe, it, expect } from 'vitest';
import { GenerationPlanner } from '../../src/generation/generation-planner.js';
import { InterviewSession } from '../../src/interview/interview-schema.js';

describe('GenerationPlanner', () => {
    const planner = new GenerationPlanner();

    it('should block PRD generation if BRD is missing and mode is strict', () => {
        const report = planner.plan('PRD', [], [], 'strict');
        expect(report.status).toBe('blocked');
        expect(report.hardDependenciesSatisfied).toBe(false);
        expect(report.missingInputs).toContain('BRD');
    });

    it('should allow PRD generation if BRD is missing but mode is flexible', () => {
        const report = planner.plan('PRD', [], [], 'flexible');
        expect(report.status).toBe('partial_ready');
        expect(report.hardDependenciesSatisfied).toBe(false);
        expect(report.warnings.length).toBeGreaterThan(0);
    });

    it('should satisfy PRD dependency if a completed BRD interview session exists', () => {
        const mockSessions: InterviewSession[] = [
            {
                sessionId: 's1',
                documentId: 'BRD',
                roleId: 'business_stakeholder',
                status: 'completed',
                startedAt: '',
                updatedAt: '',
                answers: []
            }
        ];

        const report = planner.plan('PRD', [], mockSessions, 'strict');
        expect(report.status).toBe('ready');
        expect(report.hardDependenciesSatisfied).toBe(true);
        expect(report.alternativeEvidenceUsed).toContain('BRD (Interview Evidence)');
    });
});
