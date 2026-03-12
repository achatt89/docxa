import fs from 'fs/promises';
import path from 'path';
import { ProjectConfig, ProjectConfigSchema } from '../models/project-model.js';
import { Stakeholder, StakeholderSchema } from '../models/stakeholder-model.js';
import { SavedAnalysis, SavedAnalysisSchema } from '../models/analysis-model.js';

export class WorkspaceStore {
    private workspaceDir: string;

    constructor(workspaceDir: string) {
        this.workspaceDir = workspaceDir;
    }

    private get docxaDir(): string {
        return path.join(this.workspaceDir, '.docxa');
    }

    async initWorkspace(config: ProjectConfig): Promise<void> {
        await fs.mkdir(this.docxaDir, { recursive: true });
        await fs.mkdir(path.join(this.docxaDir, 'documents'), { recursive: true });
        await fs.mkdir(path.join(this.docxaDir, 'adr'), { recursive: true });

        await this.saveProjectConfig(config);
    }

    async saveProjectConfig(config: ProjectConfig): Promise<void> {
        const filePath = path.join(this.docxaDir, 'project.json');
        await fs.writeFile(filePath, JSON.stringify(config, null, 2));
    }

    async loadProjectConfig(): Promise<ProjectConfig> {
        const filePath = path.join(this.docxaDir, 'project.json');
        const data = await fs.readFile(filePath, 'utf-8');
        return ProjectConfigSchema.parse(JSON.parse(data));
    }

    async saveStakeholders(stakeholders: Stakeholder[]): Promise<void> {
        const filePath = path.join(this.docxaDir, 'stakeholders.json');
        await fs.writeFile(filePath, JSON.stringify(stakeholders, null, 2));
    }

    async loadStakeholders(): Promise<Stakeholder[]> {
        const filePath = path.join(this.docxaDir, 'stakeholders.json');
        try {
            const data = await fs.readFile(filePath, 'utf-8');
            return JSON.parse(data).map((s: any) => StakeholderSchema.parse(s));
        } catch {
            return [];
        }
    }

    async saveAnalysis(analysis: SavedAnalysis): Promise<void> {
        await fs.mkdir(this.docxaDir, { recursive: true });
        const filePath = path.join(this.docxaDir, 'analysis.json');
        await fs.writeFile(filePath, JSON.stringify(analysis, null, 2));
    }

    async loadAnalysis(): Promise<SavedAnalysis | undefined> {
        const filePath = path.join(this.docxaDir, 'analysis.json');
        try {
            const data = await fs.readFile(filePath, 'utf-8');
            return SavedAnalysisSchema.parse(JSON.parse(data));
        } catch {
            return undefined;
        }
    }

    async saveDocument(type: string, content: string): Promise<void> {
        const filePath = path.join(this.docxaDir, 'documents', `${type.toLowerCase()}.md`);
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, content);
    }

    async loadDocument(type: string): Promise<string | undefined> {
        const filePath = path.join(this.docxaDir, 'documents', `${type.toLowerCase()}.md`);
        try {
            return await fs.readFile(filePath, 'utf-8');
        } catch {
            return undefined;
        }
    }

    async listDocuments(): Promise<string[]> {
        const docsDir = path.join(this.docxaDir, 'documents');
        try {
            const files = await fs.readdir(docsDir);
            return files
                .filter(f => f.endsWith('.md'))
                .map(f => path.basename(f, '.md').toUpperCase());
        } catch {
            return [];
        }
    }

    async exists(): Promise<boolean> {
        try {
            await fs.access(this.docxaDir);
            return true;
        } catch {
            return false;
        }
    }
}
