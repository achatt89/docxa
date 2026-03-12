import { Document, DocumentType } from '../models/document-model.js';

export interface ValidationIssue {
  type: 'error' | 'warning';
  message: string;
  source: DocumentType;
  target?: DocumentType;
}

export class ConsistencyChecker {
  async check(documents: Document[]): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];

    // Map documents for easy access
    const docMap = new Map(documents.map((d) => [d.type, d]));

    // Check PRD exists if dependencies require it
    if (docMap.has('HLD') && !docMap.has('PRD')) {
      issues.push({
        type: 'error',
        message: 'HLD exists but PRD is missing.',
        source: 'HLD',
        target: 'PRD',
      });
    }

    // Check features in PRD are addressed in HLD
    const prd = docMap.get('PRD');
    const hld = docMap.get('HLD');

    if (prd && hld) {
      // Simplistic check: ensure HLD has content
      if (hld.sections.every((s) => s.content.length < 10)) {
        issues.push({
          type: 'warning',
          message: 'HLD sections are too brief; may not fully address PRD requirements.',
          source: 'HLD',
        });
      }
    }

    return issues;
  }
}
