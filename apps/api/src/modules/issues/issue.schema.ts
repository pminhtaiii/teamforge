import { z } from "zod";

export const createIssueSchema = z.object({
    title: z.string().trim().min(1),
    description: z.string().optional()
})