import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { WorkspaceStore } from '../../src/storage/workspace-store.js';
import { SavedAnalysis } from '../../src/models/analysis-model.js';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

describe('WorkspaceStore', () => {
    let tmpDir: string;
    let store: WorkspaceStore;

    beforeEach(async () => {
        tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'docxa-test-'));
        store = new WorkspaceStore(tmpDir);
        await store.initWorkspace({
            name: 'test-project',
            mode: 'greenfield',
            rootPath: tmpDir,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            analysisPath: '.docxa/analysis.json',
            documentsDir: '.docxa/documents/',
            adrDir: '.docxa/adr/',
            stakeholdersPath: '.docxa/stakeholders.json',
        });
    });

    afterEach(async () => {
        await fs.rm(tmpDir, { recursive: true, force: true });
    });

    it('should save and load analysis results', async () => {
        const mockAnalysis: SavedAnalysis = {
            scannedAt: new Date().toISOString(),
            repositoryPath: tmpDir,
            languages: ['typescript', 'javascript'],
            frameworks: ['Next.js', 'Express'],
            services: ['Docker Compose'],
            isMonorepo: false,
            architecture: {
                pattern: 'monolith',
                reasoning: 'Small repo with single entry point',
                confidence: 0.9
            },
            configFiles: ['package.json', 'tsconfig.json']
        };

        await store.saveAnalysis(mockAnalysis);
        const loaded = await store.loadAnalysis();

        expect(loaded).toBeDefined();
        expect(loaded?.frameworks).toContain('Next.js');
        expect(loaded?.architecture.pattern).toBe('monolith');
    });

    it('should return undefined if analysis does not exist', async () => {
        const loaded = await store.loadAnalysis();
        expect(loaded).toBeUndefined();
    });
});
