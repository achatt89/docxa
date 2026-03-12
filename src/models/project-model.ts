import { z } from 'zod';

export const ProjectModeSchema = z.enum(['greenfield', 'existing']);

export const ProjectConfigSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  mode: ProjectModeSchema,
  rootPath: z.string(),
  repositoryPath: z.string().optional(),
  analysisPath: z.string().default('.docxa/analysis.json'),
  documentsDir: z.string().default('.docxa/documents/'),
  adrDir: z.string().default('.docxa/adr/'),
  stakeholdersPath: z.string().default('.docxa/stakeholders.json'),
  createdAt: z.string().default(() => new Date().toISOString()),
  updatedAt: z.string().default(() => new Date().toISOString()),
});

export type ProjectConfig = z.infer<typeof ProjectConfigSchema>;
export type ProjectMode = z.infer<typeof ProjectModeSchema>;
