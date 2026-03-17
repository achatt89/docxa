import { z } from 'zod';

export const ProjectModeSchema = z.enum(['greenfield', 'existing']);

export const ProjectConfigSchema = z
  .object({
    name: z.string(),
    version: z.string().default('0.0.1'),
    description: z.string().optional(),
    mode: ProjectModeSchema,
    rootPath: z.string().optional(),
    root: z.string().optional(), // Support legacy 'root' field
    initialized: z.string().optional(),
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
    createdAt: z.string().optional(), // Make optional to support legacy
    updatedAt: z.string().optional(),
  })
  .transform((data) => {
    // Standardize 'root' to 'rootPath'
    const rootPath = data.rootPath || data.root || '';
    const root = data.root || rootPath;

    return {
      ...data,
      rootPath,
      root,
    };
  });

export type ProjectConfig = z.infer<typeof ProjectConfigSchema> & { rootPath: string };
export type ProjectMode = z.infer<typeof ProjectModeSchema>;
