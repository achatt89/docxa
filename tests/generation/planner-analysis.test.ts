import { describe, it, expect } from 'vitest';
import { GenerationPlanner } from '../../src/generation/generation-planner.js';

describe('GenerationPlanner with Analysis Evidence', () => {
  const planner = new GenerationPlanner();

  it('should satisfy functional_context if frameworks analysis is available', () => {
    // FRD requires functional_context (satisfied by FRD doc OR frameworks analysis)
    const report = planner.plan('FRD', [], [], 'strict', ['frameworks']);

    expect(report.missingRequiredEvidence).not.toContain('functional_context');
    expect(
      report.alternativeEvidenceUsed.some((e) => e.includes('Repo Analysis: frameworks')),
    ).toBe(true);
  });

  it('should satisfy architecture_context if architecture analysis is available', () => {
    // HLD requires architecture_context
    const report = planner.plan('HLD', [], [], 'strict', ['architecture']);

    expect(report.missingRequiredEvidence).not.toContain('architecture_context');
    expect(
      report.alternativeEvidenceUsed.some((e) => e.includes('Repo Analysis: architecture')),
    ).toBe(true);
  });

  it('should suggest docxa discover if analysis evidence is missing', () => {
    const report = planner.plan('TRD', [], [], 'strict', []);

    // TRD requires technical_context (satisfied by TRD doc, Architect interview, OR frameworks analysis)
    expect(
      report.suggestions.some((s) => s.includes('docxa discover') && s.includes('frameworks')),
    ).toBe(true);
  });
});
