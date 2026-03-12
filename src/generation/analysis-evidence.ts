import { SavedAnalysis } from '../models/analysis-model.js';

/**
 * Derives planner evidence keys from saved repository analysis.
 * This maps physical analysis data back to logical evidence requirements.
 */
export function deriveAnalysisEvidence(analysis: SavedAnalysis): string[] {
  const evidence: string[] = [];

  // If we have frameworks, it satisfies 'frameworks' evidence
  if (analysis.frameworks.length > 0) {
    evidence.push('frameworks');
  }

  // If we have an architectural pattern detected, it satisfies 'architecture' evidence
  if (analysis.architecture && analysis.architecture.pattern) {
    evidence.push('architecture');
  }

  // If we have services detected (e.g., Docker Compose), it satisfies 'services'
  if (analysis.services.length > 0) {
    evidence.push('services');
  }

  // If we have config files scanned, it might satisfy 'config_files' (placeholder for future use)
  if (analysis.configFiles.length > 0) {
    evidence.push('config_files');
  }

  return evidence;
}
