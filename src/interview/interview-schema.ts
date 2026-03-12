import { z } from 'zod';

export const InterviewQuestionSchema = z.object({
  id: z.string(),
  sectionId: z.string(),
  question: z.string(),
  answerType: z.enum([
    'short_text',
    'long_text',
    'boolean',
    'number',
    'single_select',
    'multi_select',
    'single_select_or_text',
    'list',
    'table',
  ]),
  required: z.boolean().default(true),
  options: z.array(z.string()).optional(),
  guidance: z.array(z.string()).optional(),
  dependsOn: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

export const InterviewDefinitionSchema = z.object({
  documentId: z.string(),
  roleId: z.string(),
  name: z.string(),
  purpose: z.string().optional(),
  modeSupport: z.array(z.string()).optional(),
  questions: z.array(InterviewQuestionSchema),
});

export const InterviewAnswerSchema = z.object({
  questionId: z.string(),
  rawAnswer: z.unknown(),
  normalizedAnswer: z.unknown().optional(),
  confidence: z.number().min(0).max(1).optional(),
  provenance: z
    .object({
      source: z.enum(['stakeholder', 'inferred', 'generated']),
      timestamp: z.string(),
    })
    .optional(),
});

export const InterviewSessionSchema = z.object({
  sessionId: z.string(),
  documentId: z.string(),
  roleId: z.string(),
  stakeholderName: z.string().optional(),
  status: z.enum(['not_started', 'in_progress', 'completed', 'abandoned']),
  startedAt: z.string(),
  updatedAt: z.string(),
  answers: z.array(InterviewAnswerSchema),
});

export type InterviewQuestion = z.infer<typeof InterviewQuestionSchema>;
export type InterviewDefinition = z.infer<typeof InterviewDefinitionSchema>;
export type InterviewAnswer = z.infer<typeof InterviewAnswerSchema>;
export type InterviewSession = z.infer<typeof InterviewSessionSchema>;
export type InterviewAnswerType = InterviewQuestion['answerType'];
export type InterviewStatus = InterviewSession['status'];
