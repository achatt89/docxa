import fs from 'fs/promises';
import path from 'path';
import { Document, DocumentType } from '../models/document-model.js';

export interface ValidationIssue {
  type: 'error' | 'warning';
  message: string;
  source: DocumentType | 'INTERNAL';
  target?: DocumentType;
}

export class ConsistencyChecker {
  async checkWorkspace(cwd: string): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];
    const docxaDir = path.join(cwd, '.docxa');

    try {
      await fs.access(docxaDir);
    } catch {
      issues.push({
        type: 'error',
        message: 'No .docxa workspace found. Run `docxa init` first.',
        source: 'INTERNAL',
      });
      return issues;
    }

    const requiredFiles = ['project.json', 'stakeholders.json'];
    for (const file of requiredFiles) {
      try {
        await fs.access(path.join(docxaDir, file));
      } catch {
        issues.push({
          type: 'error',
          message: `Workspace metadata file missing: ${file}`,
          source: 'INTERNAL',
        });
      }
    }

    // Check templates if they exist
    const templateDirs = [
      path.join(cwd, 'templates', 'documents'),
      path.join(cwd, 'templates', 'interviews'),
    ];

    for (const dir of templateDirs) {
      try {
        const stats = await fs.stat(dir);
        if (stats.isDirectory()) {
          const files = await fs.readdir(dir);
          if (files.length === 0) {
            issues.push({
              type: 'warning',
              message: `Template directory is empty: ${path.relative(cwd, dir)}`,
              source: 'INTERNAL',
            });
          }
        }
      } catch {
        // Not an error if optional template dirs are missing
      }
    }

    return issues;
  }

  async check(documents: Document[]): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];

    // Map documents for easy access
    const docMap = new Map(documents.map((d) => [d.type, d]));

    // Check PRD exists if dependencies require it
    if (docMap.has('HLD' as DocumentType) && !docMap.has('PRD' as DocumentType)) {
      issues.push({
        type: 'error',
        message: 'HLD exists but PRD is missing.',
        source: 'HLD' as DocumentType,
        target: 'PRD' as DocumentType,
      });
    }

    // Check features in PRD are addressed in HLD
    const prd = docMap.get('PRD' as DocumentType);
    const hld = docMap.get('HLD' as DocumentType);

    if (prd && hld) {
      // Simplistic check: ensure HLD has content
      if (hld.sections.every((s) => s.content.length < 10)) {
        issues.push({
          type: 'warning',
          message: 'HLD sections are too brief; may not fully address PRD requirements.',
          source: 'HLD' as DocumentType,
        });
      }
    }

    return issues;
  }
}
