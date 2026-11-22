import { db } from "../../db/client.js";
import { issues } from "../../db/schema.js";
import type { Issue, CreateIssueInput, UpdateIssueInput } from "./issue.types.js";
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

export async function updateIssueInDb(id: string, input: UpdateIssueInput): Promise<Issue | undefined> {
    const result = await db.update(issues).set(input).where(eq(issues.id, id)).returning()
    return result[0]
}

export async function deleteIssueFromDb(id: string): Promise<boolean> {
    const result = await db.delete(issues).where(eq(issues.id, id)).returning()
    return result.length > 0
}