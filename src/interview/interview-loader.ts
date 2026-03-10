import fs from 'fs/promises';
import path from 'path';
import { InterviewDefinition, InterviewDefinitionSchema } from './interview-schema.js';
import { TemplateSystem } from '../generation/template-system.js';
import { InterviewTemplateAlignment } from './interview-template-alignment.js';

export class InterviewLoader {
    private templateSystem?: TemplateSystem;

    constructor(templateSystem?: TemplateSystem) {
        this.templateSystem = templateSystem;
    }

    async loadInterviews(interviewDir: string): Promise<InterviewDefinition[]> {
        const interviews: InterviewDefinition[] = [];
        await this.recursiveLoad(interviewDir, interviews);
        return interviews;
    }

    private async recursiveLoad(currentPath: string, interviews: InterviewDefinition[]): Promise<void> {
        try {
            const entries = await fs.readdir(currentPath, { withFileTypes: true });

            for (const entry of entries) {
                const fullPath = path.join(currentPath, entry.name);

                if (entry.isDirectory()) {
                    await this.recursiveLoad(fullPath, interviews);
                } else if (entry.isFile() && entry.name.endsWith('.interview.json')) {
                    try {
                        const content = await fs.readFile(fullPath, 'utf-8');
                        const json = JSON.parse(content);
                        const validated = InterviewDefinitionSchema.parse(json);

                        // Alignment Validation
                        if (this.templateSystem) {
                            const template = this.templateSystem.getTemplate(validated.documentId);
                            if (template) {
                                InterviewTemplateAlignment.validate(validated, template);
                            } else {
                                console.warn(`Skipping alignment validation for ${validated.documentId}: Template not found.`);
                            }
                        }

                        interviews.push(validated);
                    } catch (error: any) {
                        console.error(`Failed to load interview definition at ${fullPath}: ${error.message}`);
                        throw new Error(`Interview definition validation failed for ${fullPath}: ${error.message}`);
                    }
                }
            }
        } catch (error: any) {
            if (error.code === 'ENOENT') {
                console.warn(`Interview directory not found: ${currentPath}`);
                return;
            }
            throw error;
        }
    }

    async getByDocumentAndRole(interviewDir: string, documentId: string, roleId: string): Promise<InterviewDefinition | undefined> {
        const all = await this.loadInterviews(interviewDir);
        return all.find(i => i.documentId.toUpperCase() === documentId.toUpperCase() && i.roleId === roleId);
    }
}
