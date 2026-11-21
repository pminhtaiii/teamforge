import { beforeEach, describe, it, expect } from "vitest"
import { createIssue, getIssueById, listIssues, clearIssues, updateIssue } from "../../../src/modules/issues/issue.service.js";

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

describe("Issue Service", () => {
    describe("getIssueById", () => {
        it("should return undefined when ID does not exist", () => {
            const result = getIssueById("hahaha no ID here")
            expect(result).toBeUndefined()
        })
    })
})

describe("Issue Service", () => {
    describe("listIssues", () => {
        it("should include newly created issues", () => {
            const issue1 = createIssue({ title: "Fix login bug" })
            const issue2 = createIssue({ title: "Build dashboard" })
            const result = listIssues()
            expect(result).toContainEqual(issue1)
            expect(result).toContainEqual(issue2)
        })
    })
})

describe("Issue Service", () => {
    beforeEach(() => {
        clearIssues()
    })

    describe("listIssues", () => {
        it("should return an empty array when no issues exist", () => {
            const result = listIssues()
            expect(result).toEqual([])
        })
    })
})

describe("Issue Service", () => {
    beforeEach(() => {
        clearIssues()
    })

    describe("listIssues", () => {
        it("should return exactly 2 issues", () => {
            const issue1 = createIssue({ title: "Fix login bug" });
            const issue2 = createIssue({ title: "Build dashboard" });
            const result = listIssues()
            expect(result).toHaveLength(2)
            expect(result).toContainEqual(issue1)
            expect(result).toContainEqual(issue2)
        })
    })
})

describe("Issue Service", () => {
    describe("updateIssue", () => {
        it("should update issue status", () => {
            const issue = createIssue({
                title: "Fix login bug"
            });
            const result =  updateIssue(issue.id, { status: "in_progress" })
            expect(result?.status).toBe("in_progress")
            expect(result?.title).toBe("Fix login bug")
            expect(result?.id).toBe(issue.id)
        })
    })
})

describe("Issue Service", () => {
    describe("updateIssue", () => {
        it("should update description when set to null", () => {
            const issue = createIssue({
                title: "Fix login bug",
                description: "Login fails"
            })
            const result = updateIssue(issue.id, { description: null })
            expect(result?.description).toBeNull()
        })
    })
})

describe("Issue Service", () => {
    describe("updateIssue", () => {
        it("should return undefined when issue does not exist", () => {
            const result = updateIssue(
                "00000000-0000-4000-8000-000000000000",
                { status: "done" }
            );
            expect(result).toBeUndefined();
        })
    })
})