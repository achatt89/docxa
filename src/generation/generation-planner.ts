import { InterviewSession } from '../interview/interview-schema.js';
import { DocumentTemplate } from './template-schema.js';

export type ReadinessStatus = 'ready' | 'partial_ready' | 'blocked';
export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface ReadinessReport {
    documentId: string;
    status: ReadinessStatus;
    hardDependenciesSatisfied: boolean;
    softDependenciesMissing: string[];
    availableInputs: string[];
    missingInputs: string[];
    alternativeEvidenceUsed: string[];
    confidence: ConfidenceLevel;
    warnings: string[];
}

export type GenerationMode = 'strict' | 'flexible' | 'assisted';

export class GenerationPlanner {
    // Simple rule-based dependency map for Phase 1
    private readonly dependencies: Record<string, { hard: string[], soft: string[] }> = {
        BRD: { hard: [], soft: [] },
        PRD: { hard: ['BRD'], soft: [] },
        FRD: { hard: ['PRD'], soft: [] },
        TRD: { hard: ['FRD'], soft: ['PRD'] },
        NFR: { hard: ['TRD', 'HLD'], soft: [] },
        HLD: { hard: ['TRD'], soft: ['NFR', 'FRD'] },
        LLD: { hard: ['HLD'], soft: ['TRD', 'FRD'] },
        ADR: { hard: ['HLD'], soft: ['NFR'] }
    };

    plan(
        documentId: string,
        existingDocs: string[],
        sessions: InterviewSession[],
        mode: GenerationMode = 'flexible'
    ): ReadinessReport {
        const deps = this.dependencies[documentId] || { hard: [], soft: [] };
        const availableInputs: string[] = [...existingDocs];
        const missingInputs: string[] = [];
        const alternativeEvidenceUsed: string[] = [];
        const warnings: string[] = [];

        // Check sessions for evidence
        const sessionsForDoc = sessions.filter(s => s.documentId === documentId);
        if (sessionsForDoc.length > 0) {
            alternativeEvidenceUsed.push(`Interview Session (${sessionsForDoc.length})`);
        }

        // Evaluate hard dependencies
        let hardSatisfied = true;
        for (const hardDep of deps.hard) {
            const hasDoc = existingDocs.includes(hardDep);
            const hasInterview = sessions.some(s => s.documentId === hardDep && s.status === 'completed');

            if (!hasDoc && !hasInterview) {
                hardSatisfied = false;
                missingInputs.push(hardDep);
            } else if (!hasDoc && hasInterview) {
                alternativeEvidenceUsed.push(`${hardDep} (Interview Evidence)`);
            } else {
                availableInputs.push(hardDep);
            }
        }

        // Evaluate soft dependencies
        const softMissing: string[] = [];
        for (const softDep of deps.soft) {
            if (!existingDocs.includes(softDep) && !sessions.some(s => s.documentId === softDep)) {
                softMissing.push(softDep);
            }
        }

        // Determine status
        let status: ReadinessStatus = 'ready';
        if (!hardSatisfied) {
            status = mode === 'strict' ? 'blocked' : 'partial_ready';
            if (mode === 'flexible') {
                warnings.push(`Generating without full hard dependencies: ${missingInputs.join(', ')}`);
            }
        } else if (softMissing.length > 0) {
            status = 'partial_ready';
            warnings.push(`Optional context missing: ${softMissing.join(', ')}`);
        }

        // Confidence calculation (simplified)
        let confidence: ConfidenceLevel = 'high';
        if (!hardSatisfied) confidence = 'low';
        else if (softMissing.length > 0 || alternativeEvidenceUsed.length > 0) confidence = 'medium';

        return {
            documentId,
            status,
            hardDependenciesSatisfied: hardSatisfied,
            softDependenciesMissing: softMissing,
            availableInputs,
            missingInputs,
            alternativeEvidenceUsed,
            confidence,
            warnings
        };
    }
}
