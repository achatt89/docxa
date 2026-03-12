import { z } from 'zod';

export const DocumentTypeSchema = z.enum(['BRD', 'PRD', 'FRD', 'TRD', 'HLD', 'LLD', 'NFR', 'ADR']);

export const ProvenanceSourceSchema = z.enum(['inferred', 'generated', 'confirmed']);

export const DocumentSectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  provenance: z.object({
    source: ProvenanceSourceSchema,
    stakeholderId: z.string().optional(),
    timestamp: z.string(),
    reasoning: z.string().optional(),
  }),
});

export const DocumentSchema = z.object({
  type: DocumentTypeSchema,
  version: z.string().default('1.0.0'),
  status: z.enum(['draft', 'review', 'approved']).default('draft'),
  sections: z.array(DocumentSectionSchema),
  dependencies: z.array(DocumentTypeSchema).default([]),
  metadata: z.record(z.any()).default({}),
  lastUpdated: z.string().default(() => new Date().toISOString()),
});

export type DocumentType = z.infer<typeof DocumentTypeSchema>;
export type Document = z.infer<typeof DocumentSchema>;
export type DocumentSection = z.infer<typeof DocumentSectionSchema>;
export type ProvenanceSource = z.infer<typeof ProvenanceSourceSchema>;
