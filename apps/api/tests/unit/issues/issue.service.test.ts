import { describe, it, expect } from "vitest"
import { createIssue, getIssueById } from "../../../src/modules/issues/issue.service.js";

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

describe("Issue Service", () => {
    describe("createIssue", () => {
        it("should create a issue with a description", () => {
            const description =  "Bug found in the authentication system"
            const issue = createIssue({
                "title": "Fix login bug",
                description
            })
            expect(issue.title).toBe("Fix login bug")
            expect(issue.description).toBe(description)
            expect(issue.status).toBe("todo")
            expect(issue.createdAt).toBeInstanceOf(Date)
            expect(issue.id).toEqual(expect.any(String))
        })
    })
})

describe("Issue Service", () => {
    describe("getIssueById", () => {
        it("should return an issue when ID exists", () => {
            const issue = createIssue({
                "title": "Implement authentication"
            })
            const result = getIssueById(issue.id)
            expect(result).toEqual(issue)
        })
    })
})