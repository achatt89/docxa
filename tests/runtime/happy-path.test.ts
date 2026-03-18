import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { initializeRuntime } from '../../src/runtime/initialize-runtime.js';
import { ConsistencyChecker } from '../../src/generation/consistency-checker.js';
import { ProjectConfig } from '../../src/models/project-model.js';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

describe('Docxa Happy Path E2E', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'docxa-test-'));
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it('completes a full workflow: init -> validate -> generate (mocked)', async () => {
    const runtime = await initializeRuntime({ cwd: tempDir });

    // 1. Initial State - Validate should fail
    const checker = new ConsistencyChecker();
    const initialIssues = await checker.checkWorkspace(tempDir);
    expect(initialIssues.length).toBeGreaterThan(0);
    // It might be "No .docxa workspace" or "Workspace metadata file missing"
    // depending on whether the folder was created by sub-service initialization.
    expect(initialIssues[0].message).toMatch(/No .docxa workspace|metadata file missing/);

    // 2. Init
    const config: ProjectConfig = {
      name: 'test-project',
      version: '0.0.1',
      mode: 'existing',
      rootPath: tempDir,
      root: tempDir,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      analysisPath: '.docxa/analysis/repo-analysis.json',
      documentsDir: '.docxa/documents/',
      adrDir: '.docxa/adr/',
      stakeholdersPath: '.docxa/stakeholders.json',
      documents: {},
      interviews: [],
      stakeholders: [],
    };
    await runtime.store.initWorkspace(config);

    // 3. Post-Init Validate - Should pass
    const postInitIssues = await checker.checkWorkspace(tempDir);
    expect(postInitIssues.filter((i) => i.type === 'error').length).toBe(0);

    // 4. Generate PRD (Partial Ready due to missing context, but possible in flexible mode)
    const { GenerationPlanner } = await import('../../src/generation/generation-planner.js');
    const planner = new GenerationPlanner();
    const plan = planner.plan('PRD', [], [], 'flexible', []);

    expect(plan.status).toBe('partial_ready');
    expect(plan.missingRequiredEvidence).toContain('business_context');

    // 5. Verify Structure
    const docxaDir = path.join(tempDir, '.docxa');
    expect(
      await fs
        .access(path.join(docxaDir, 'project.json'))
        .then(() => true)
        .catch(() => false),
    ).toBe(true);
    expect(
      await fs
        .access(path.join(docxaDir, 'adr'))
        .then(() => true)
        .catch(() => false),
    ).toBe(true);
  });
});
