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
  configContents: z.record(z.string()).optional(),
  directoriesSample: z.array(z.string()).optional(),
});

export type SavedAnalysis = z.infer<typeof SavedAnalysisSchema>;

// The Comprehensive Analysis represents the rich LLM-generated output
export interface ComprehensiveAnalysis {
  analyzed: string;
  project: {
    name: string;
    type: string;
    domain?: string;
    description: string;
    owner?: string;
    ownerBackground?: string;
  };
  rendering?: Record<string, any>;
  techStack: Record<string, any>;
  devTooling: Record<string, any>;
  routes?: Array<{ path: string; label: string }>;
  architecture?: {
    pattern?: string;
    reasoning?: string;
    confidence?: number;
    patterns?: string[];
    designSystem?: Record<string, any>;
  };
  directoryStructure: Record<string, string>;
  keyComponents?: Array<{ name: string; role: string }>;
  seo?: Record<string, any>;
  externalIntegrations?: Array<{ service: string; method: string }>;
  performance?: Record<string, any>;
  evidenceSatisfied: string[];
  evidenceReadiness?: Record<string, { status: string; missing: string[]; suggestion?: string }>;
}
