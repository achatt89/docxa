import { z } from 'zod';

export const SavedAnalysisSchema = z.object({
    scannedAt: z.string(),
    repositoryPath: z.string(),
    languages: z.array(z.string()),
    frameworks: z.array(z.string()),
    services: z.array(z.string()),
    isMonorepo: z.boolean(),
    architecture: z.object({
        pattern: z.string(),
        reasoning: z.string(),
        confidence: z.number(),
    }),
    configFiles: z.array(z.string()),
    directoriesSample: z.array(z.string()).optional(),
});

export type SavedAnalysis = z.infer<typeof SavedAnalysisSchema>;
