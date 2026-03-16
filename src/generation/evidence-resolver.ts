import { SavedAnalysis } from '../models/analysis-model.js';
import { InterviewSession } from '../interview/interview-schema.js';
import { deriveAnalysisEvidence } from './analysis-evidence.js';

export interface EvidenceView {
  technicalContext: string[];
  businessIntent: string[];
  domainKnowledge: string[];
  all: string[];
}

export class EvidenceResolver {
  resolve(
    analysis: SavedAnalysis | undefined,
    sessions: InterviewSession[],
    existingDocs: string[],
  ): EvidenceView {
    const technicalContext = analysis ? deriveAnalysisEvidence(analysis) : [];
    const businessIntent = sessions
      .filter((s) => s.status === 'completed')
      .map((s) => s.documentId);

    // Domain knowledge is satisfied by existing finalized documents
    const domainKnowledge = existingDocs;

    return {
      technicalContext,
      businessIntent,
      domainKnowledge,
      all: [...new Set([...technicalContext, ...businessIntent, ...domainKnowledge])],
    };
  }
}
