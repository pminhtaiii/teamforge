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
        
    })
})