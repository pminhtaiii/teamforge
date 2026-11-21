import { db } from "../../db/client.js";
import { issues } from "../../db/schema.js";
import type { Issue, CreateIssueInput } from "./issue.types.js";
import { eq } from "drizzle-orm"

export async function findAllIssues(): Promise<Issue[]> {
    const result = await db.select().from(issues)
    return result
}

export async function findIssueById(id: string): Promise<Issue| undefined> {
    const result = await db.select().from(issues).where(eq(issues.id, id)).limit(1)
    return result[0]
}

export async function insertIssue(input: CreateIssueInput): Promise<Issue> {
    const newIssue = {
        "title": input.title,
        "description": input.description ?? null
    }
    const result = await db.insert(issues).values(newIssue).returning()
    const insertedIssue = result[0]
    if (!insertedIssue) {
        throw new Error("Failed to insert issue")
    }
    return insertedIssue
}