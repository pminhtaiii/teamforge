import { describe, it, expect, afterAll } from "vitest";
import { client } from "../../../src/db/client.js";
import { insertIssue, findIssueById, findAllIssues } from "../../../src/modules/issues/issue.repository.js";
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

        expect(issue.title).toBe("Test PostgreSQL")
        expect(issue.status).toBe("todo")
        expect(issue.id).toEqual(expect.any(String))

        try {
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
});