import { z } from 'zod';

export const ProjectModeSchema = z.enum(['greenfield', 'existing']);

export const ProjectConfigSchema = z.object({
  name: z.string(),
  version: z.string().default('0.0.1'),
  description: z.string().optional(),
  mode: ProjectModeSchema,
  rootPath: z.string(),
  repositoryPath: z.string().optional(),
  analysisPath: z.string().default('.docxa/analysis/repo-analysis.json'),
  documentsDir: z.string().default('.docxa/documents/'),
  adrDir: z.string().default('.docxa/adr/'),
  stakeholdersPath: z.string().default('.docxa/stakeholders.json'),
  documents: z
    .record(
      z.object({
        path: z.string(),
        generated: z.string(),
        status: z.enum(['draft', 'review', 'finalized']),
      }),
    )
    .default({}),
  interviews: z.array(z.string()).default([]),
  stakeholders: z.array(z.string()).default([]),
  createdAt: z.string().default(() => new Date().toISOString()),
  updatedAt: z.string().default(() => new Date().toISOString()),
});

export type ProjectConfig = z.infer<typeof ProjectConfigSchema>;
export type ProjectMode = z.infer<typeof ProjectModeSchema>;
