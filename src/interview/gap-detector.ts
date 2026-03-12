import { DocumentTemplate } from '../generation/template-schema.js';
import { InterviewSession } from './interview-schema.js';

export interface EvidenceGap {
    sectionId: string;
    severity: 'high' | 'medium' | 'low';
    reason: string;
    suggestedRole?: string;
}

export class GapDetector {
    detectGaps(template: DocumentTemplate, sessions: InterviewSession[]): EvidenceGap[] {
        const gaps: EvidenceGap[] = [];
        /*
        const answeredQuestionIds = new Set(
            sessions.flatMap(s => s.answers.map(a => a.questionId))
        );
        */

        // Simple strategy for Phase 1: 
        // Check if each template section has at least one corresponding interview answer
        // For this, we assume the interview question definitions (not loaded here) 
        // will tag questions with sectionIds.
        // If not, we just check if any answers exist.

        for (const section of template.sections) {
            const hasAnswerForSection = sessions.some(s =>
                s.answers.some(_a => {
                    // This is a placeholder for more advanced section-to-question mapping
                    // For now, we'll assume if there's any answer in a session matching 
                    // the documentId, it's progress. 
                    // A better version would check specific section mappings.
                    return true;
                })
            );

            if (section.required && !hasAnswerForSection) {
                gaps.push({
                    sectionId: section.id,
                    severity: 'high',
                    reason: `No evidence found for required section: ${section.title}`,
                    suggestedRole: 'STAKEHOLDER'
                });
            }
        }

        return gaps;
    }
}
