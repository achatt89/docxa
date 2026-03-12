import { z } from 'zod';

export type TemplateSection = {
  id: string;
  title: string;
  description?: string;
  purpose?: string;
  required?: boolean;
  recommendedSources?: string[];
  guidance?: string[];
  subsections?: (TemplateSection | string)[];
};

export const TemplateSectionSchema: z.ZodType<TemplateSection> = z.lazy(() =>
  z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional(),
    purpose: z.string().optional(),
    required: z.boolean().default(true),
    recommendedSources: z.array(z.string()).default([]),
    guidance: z.array(z.string()).default([]),
    subsections: z.array(z.union([z.string(), TemplateSectionSchema])).optional(),
  }),
);

export const TemplateMetadataSchema = z.object({
  description: z.string().optional(),
  primaryOwner: z.string().optional(),
  contributors: z.array(z.string()).default([]),
});

export const TemplatePromptHintsSchema = z.object({
  systemIntent: z.string().optional(),
  rules: z.array(z.string()).default([]),
  mustDo: z.array(z.string()).default([]),
  mustNotDo: z.array(z.string()).default([]),
});

export const DocumentTemplateSchema = z.object({
  documentId: z.string(),
  name: z.string(),
  phase: z.number().optional(),
  version: z.string().default('1.0.0'),
  description: z.string().optional(), // Top level description supported in existing JSON
  metadata: TemplateMetadataSchema.optional(),
  documentControl: z
    .object({
      sections: z.array(z.string()).default([]),
    })
    .optional(),
  dependencies: z.array(z.string()).default([]),
  sections: z.array(TemplateSectionSchema),
  validationRules: z.array(z.string()).default([]),
  downstreamDependencies: z.array(z.string()).default([]),
  promptHints: TemplatePromptHintsSchema.optional(),
  // Additional fields from current JSON templates
  modeSupport: z.array(z.string()).optional(),
  inputSources: z.record(z.array(z.string())).optional(),
  generationPolicy: z
    .object({
      allowPartialDrafts: z.boolean().optional(),
      requiresHumanConfirmation: z.boolean().optional(),
      provenanceLabels: z.array(z.string()).optional(),
    })
    .optional(),
});

export type DocumentTemplate = z.infer<typeof DocumentTemplateSchema>;
