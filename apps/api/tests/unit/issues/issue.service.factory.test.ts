import { describe, it, expect, vi, beforeEach } from "vitest";
import { createIssueService } from "../../../src/modules/issues/issue.service.factory.js";
import type { IssueRepository } from "../../../src/modules/issues/issue.repository.interface.js";
import type { Issue } from "../../../src/modules/issues/issue.types.js";

const mockRepo: IssueRepository = {
    findAll: vi.fn(async () => []),
    findById: vi.fn(async () => undefined),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
}

describe("Issue Service Factory", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })
    
    describe("listIssues", () => {
        it("should return all issues using repository", async () => {
            const service = createIssueService(mockRepo)
            const result = await service.listIssues()
            expect(result).toEqual([])
            expect(mockRepo.findAll).toHaveBeenCalledOnce()
        })

        it("should return an issue in the next turn", async () => {
            const service = createIssueService(mockRepo)
            const issue: Issue = {
                id: "issue-1",
                title: "Learning Typescript",
                description: "Learning Typescript is not that hard tbh",
                status: "todo",
                createdAt: new Date()
            }

            vi.mocked(mockRepo.findAll).mockResolvedValueOnce([issue])

            const result = await service.listIssues()
            expect(result).toEqual([issue])
            expect(mockRepo.findAll).toHaveBeenCalledOnce()
        })
    })
    describe("getIssueById", () => {
        it("should return an issue matching the ID", async () => {
            const service = createIssueService(mockRepo)
            const issue: Issue = {
                id: "issue-1",
                title: "Learning Typescript",
                description: "Learning Typescript is not that hard tbh",
                status: "todo",
                createdAt: new Date()
            }
            vi.mocked(mockRepo.findById).mockResolvedValueOnce(issue)
            const result = await service.getIssueById(issue.id)
            expect(result).toEqual(issue)
            expect(mockRepo.findById).toHaveBeenCalledOnce()
            expect(mockRepo.findById).toHaveBeenCalledWith(issue.id)
        })
        it("should return undefined if the issue does not exist", async () => {
            const service = createIssueService(mockRepo)
            vi.mocked(mockRepo.findById).mockResolvedValueOnce(undefined)
            const result = await service.getIssueById("invalid-something")
            expect(result).toBeUndefined()
            expect(mockRepo.findById).toHaveBeenCalledWith("invalid-something")
            expect(mockRepo.findById).toHaveBeenCalledOnce()
        })
    })
})