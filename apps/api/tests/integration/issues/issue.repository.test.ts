import { describe, it, expect, afterAll } from "vitest";
import { client } from "../../../src/db/client.js";
import { insertIssue, findIssueById, findAllIssues, updateIssueInDb } from "../../../src/modules/issues/issue.repository.js";
import { db } from "../../../src/db/client.js";
import { issues } from "../../../src/db/schema.js";
import { eq } from "drizzle-orm";

describe("Issue Repository", () => {
    afterAll(async () => {
        await client.end();
    });

    it("should insert an issue into PostgreSQL", async () => {
        const issue = await insertIssue({
            title: "Test PostgreSQL",
            description: "Integration testing"
        });

        try {
            expect(issue.title).toBe("Test PostgreSQL")
            expect(issue.status).toBe("todo")
            expect(issue.id).toEqual(expect.any(String))
            const found = await findIssueById(issue.id)
            expect(found).toEqual(issue)
        } finally {
            await db.delete(issues).where(eq(issues.id, issue.id))
        }
    })

    it("should include inserted issue in database", async () => {
        const issue = await insertIssue({
            title: "Test findAllIssues"
        })

        try {
            const found = await findAllIssues()
            expect(found).toContainEqual(issue)
        } finally {
            await db.delete(issues).where(eq(issues.id, issue.id))
        }
    })

    it("should update issue status in database", async () => {
        const issue = await insertIssue({
            title: "Test updateIssue"
        })

        try {
            const result = await updateIssueInDb(issue.id, { "status": "in_progress" })
            expect(result?.status).toBe("in_progress")
            
            const found = await findIssueById(issue.id)
            expect(found?.title).toBe("Test updateIssue")
            expect(found?.status).toBe("in_progress")
        } finally {
            await db.delete(issues).where(eq(issues.id, issue.id))
        }
    })
});