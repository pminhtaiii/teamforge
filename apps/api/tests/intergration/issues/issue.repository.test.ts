import { describe, it, expect, afterAll } from "vitest";
import { client } from "../../../src/db/client.js";
import {
    insertIssue,
    findIssueById
} from "../../../src/modules/issues/issue.repository.js";

describe("Issue Repository", () => {
    afterAll(async () => {
        await client.end()
    })

    it("should insert an issue into PostgreSQL", async () => {
        const issue = await insertIssue({
            title: "Test PostgreSQL",
            description: "Intergration testing"
        })
        expect(issue.title).toBe("Test PostgreSQL")
        expect(issue.description).toBe("Intergration testing")
        expect(issue.id).toEqual(expect.any(String))

        const found = await findIssueById(issue.id)
        expect(found).toEqual(issue)
    })
})