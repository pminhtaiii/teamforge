import { describe, it, expect, vi, beforeEach } from "vitest";
import { createIssueService } from "../../../src/modules/issues/issue.service.js";
import type { IssueRepository } from "../../../src/modules/issues/issue.repository.interface.js";
import type { Issue, CreateIssueInput, UpdateIssueInput } from "../../../src/modules/issues/issue.types.js";

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

    describe("updateIssue", () => {
        it("should update an existing issue", async () => {
            const service = createIssueService(mockRepo)
            const input: UpdateIssueInput = {
                status: "in_progress"
            }
            const issue: Issue = {
                id: "issue-1",
                title: "Learning Typescript",
                description: "Learning Typescript is not that hard tbh",
                status: "todo",
                createdAt: new Date()
            }
            const updatedIssue: Issue = {
                ...issue,
                status: "in_progress"
            }
            vi.mocked(mockRepo.update).mockResolvedValueOnce(updatedIssue)
            const result = await service.updateIssue(issue.id, input)
            expect(result).toEqual(updatedIssue)
            expect(result?.status).toBe("in_progress")
            expect(mockRepo.update).toHaveBeenCalledOnce()
            expect(mockRepo.update).toHaveBeenCalledWith(issue.id, input)
        })

        it("should return undefined when issue does not exist", async () => {
            const service = createIssueService(mockRepo)
            const input: UpdateIssueInput = {
                status: "done"
            }
            vi.mocked(mockRepo.update).mockResolvedValueOnce(undefined)
            const result = await service.updateIssue("issue-666", input)
            expect(result).toBeUndefined()
            expect(mockRepo.update).toHaveBeenCalledOnce()
            expect(mockRepo.update).toHaveBeenCalledWith("issue-666", input)
        })
    })

    describe("deleteIssue", () => {
        it("should delete an existing issue", async () => {
            const service = createIssueService(mockRepo)
            vi.mocked(mockRepo.delete).mockResolvedValueOnce(true)
            const result = await service.deleteIssue("issue-1")
            expect(result).toBe(true)
            expect(mockRepo.delete).toHaveBeenCalledOnce()
            expect(mockRepo.delete).toHaveBeenCalledWith("issue-1")
        })

        it("should return false when issue does not exist", async () => {
            const service = createIssueService(mockRepo)
            vi.mocked(mockRepo.delete).mockResolvedValueOnce(false)
            const result = await service.deleteIssue("issue-666")
            expect(result).toBe(false)
            expect(mockRepo.delete).toHaveBeenCalledOnce()
            expect(mockRepo.delete).toHaveBeenCalledWith("issue-666")
        })
    })
})