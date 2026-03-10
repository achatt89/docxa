import { z } from 'zod';

export const StakeholderRoleSchema = z.enum([
    'pm',
    'architect',
    'developer',
    'qa',
    'delivery_manager',
    'client',
    'ops',
]);

export const StakeholderSchema = z.object({
    id: z.string(),
    name: z.string(),
    role: StakeholderRoleSchema,
    email: z.string().email().optional(),
    interviews: z.array(z.object({
        timestamp: z.string(),
        transcriptPath: z.string(),
        summary: z.string(),
    })).default([]),
});

export type Stakeholder = z.infer<typeof StakeholderSchema>;
export type StakeholderRole = z.infer<typeof StakeholderRoleSchema>;
