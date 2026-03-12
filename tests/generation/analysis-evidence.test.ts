import { describe, it, expect } from 'vitest';
import { deriveAnalysisEvidence } from '../../src/generation/analysis-evidence.js';
import { SavedAnalysis } from '../../src/models/analysis-model.js';

describe('analysis-evidence', () => {
  it('should derive evidence keys from populated analysis', () => {
    const mockAnalysis: SavedAnalysis = {
      scannedAt: new Date().toISOString(),
      repositoryPath: '/test',
      languages: ['ts'],
      frameworks: ['React'],
      services: ['Docker'],
      isMonorepo: false,
      architecture: {
        pattern: 'layered',
        reasoning: 'Reasoning...',
        confidence: 1.0,
      },
      configFiles: ['package.json'],
    };

    const evidence = deriveAnalysisEvidence(mockAnalysis);
    expect(evidence).toContain('frameworks');
    expect(evidence).toContain('architecture');
    expect(evidence).toContain('services');
    expect(evidence).toContain('config_files');
  });

  it('should return empty keys for empty analysis', () => {
    const mockAnalysis: SavedAnalysis = {
      scannedAt: new Date().toISOString(),
      repositoryPath: '/test',
      languages: [],
      frameworks: [],
      services: [],
      isMonorepo: false,
      architecture: {
        pattern: '',
        reasoning: '',
        confidence: 0,
      },
      configFiles: [],
    };

    const evidence = deriveAnalysisEvidence(mockAnalysis);
    expect(evidence.length).toBe(0);
  });
});
