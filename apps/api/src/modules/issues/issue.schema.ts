import { z } from "zod";

export const createIssueSchema = z.object({
    title: z.string().trim().min(1),
    description: z.string().optional()
})

export const updateIssueSchema = z.object({
    title: z.string().trim().min(1).optional(),
    description: z.string().nullable().optional(),
    status: z.enum(["todo", "in_progress", "done"]).optional()
})

export const issueIdSchema = z.string().uuid()