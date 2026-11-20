import { describe, it, expect } from "vitest"
import { createIssue } from "../../../src/modules/issues/issue.service.js";

describe("Issue Service", () => {
    describe("createIssue", () => {
        it("should create an issue with default types", () => {
            const issue = createIssue({
                "title": "Fix login bug"
            })
            expect(issue.title).toBe("Fix login bug")
            expect(issue.description).toBeNull()
            expect(issue.status).toBe("todo")
            expect(issue.createdAt).toBeInstanceOf(Date)
            expect(issue.id).toEqual(expect.any(String))
        })
    })
})