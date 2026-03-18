import { z } from 'zod';

export const SavedAnalysisSchema = z.object({
  scannedAt: z.string(),
  repositoryPath: z.string(),
  languages: z.array(z.string()),
  frameworks: z.array(z.string()),
  services: z.array(z.string()),
  isMonorepo: z.boolean(),
  architecture: z
    .object({
      pattern: z.string().optional(),
      reasoning: z.string().optional(),
      confidence: z.number().optional(),
      patterns: z.array(z.string()).optional(),
      designSystem: z.record(z.any()).optional(),
    })
    .catchall(z.any()),
  configFiles: z.array(z.string()),
  configContents: z.record(z.string()).optional(),
  directoriesSample: z.array(z.string()).optional(),

  // Rich LLM Analysis Output
  analyzed: z.string(),
  project: z.object({
    name: z.string(),
    type: z.string(),
    domain: z.string().optional(),
    description: z.string(),
    owner: z.string().optional(),
    ownerBackground: z.string().optional(),
  }),
  rendering: z.record(z.any()).optional(),
  techStack: z.record(z.any()),
  devTooling: z.record(z.any()),
  routes: z
    .array(
      z.object({
        path: z.string(),
        label: z.string(),
      }),
    )
    .optional(),
  directoryStructure: z.record(z.string()),
  keyComponents: z
    .array(
      z.object({
        name: z.string(),
        role: z.string(),
      }),
    )
    .optional(),
  seo: z.record(z.any()).optional(),
  externalIntegrations: z
    .array(
      z.object({
        service: z.string(),
        method: z.string(),
      }),
    )
    .optional(),
  performance: z.record(z.any()).optional(),
  evidenceSatisfied: z.array(z.string()),
  evidenceReadiness: z
    .record(
      z.object({
        status: z.string(),
        missing: z.array(z.string()),
        suggestion: z.string().optional(),
      }),
    )
    .optional(),
});

export type SavedAnalysis = z.infer<typeof SavedAnalysisSchema>;
