import { describe, it, expect, vi, beforeEach } from "vitest";
import { createIssueService } from "../../../src/modules/issues/issue.service.factory.js";
import type { IssueRepository } from "../../../src/modules/issues/issue.repository.interface.js";
import type { Issue, CreateIssueInput } from "../../../src/modules/issues/issue.types.js";

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

    describe("createIssue", () => {
        it("should return the issue after created", async () => {
            const service = createIssueService(mockRepo)
            const issue: Issue = {
                id: "issue-1",
                title: "Learning Typescript",
                description: "Learning Typescript is not that hard tbh",
                status: "todo",
                createdAt: new Date()
            }
            const input: CreateIssueInput = {
                title: "Learning Typescript",
                description: "Learning Typescript is not that hard tbh"
            };
            vi.mocked(mockRepo.insert).mockResolvedValueOnce(issue)
            const result = await service.createIssue(input)
            expect(result).toEqual(issue)
            expect(mockRepo.insert).toHaveBeenCalledOnce()
            expect(mockRepo.insert).toHaveBeenCalledWith(input)
        })

        it("should propagate error when repository fails", async () => {
            const service = createIssueService(mockRepo)
            const input: CreateIssueInput = {
                title: "Learning Typescript"
            }
            vi.mocked(mockRepo.insert).mockRejectedValueOnce(new Error("Database error"))
            await expect(service.createIssue(input)).rejects.toThrow("Database error")
            expect(mockRepo.insert).toHaveBeenCalledOnce()
            expect(mockRepo.insert).toHaveBeenCalledWith(input)
        })
    })
})