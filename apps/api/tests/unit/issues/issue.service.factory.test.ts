import { describe, it, expect, vi } from "vitest";
import { createIssueService } from "../../../src/modules/issues/issue.service.factory.js";
import type { IssueRepository } from "../../../src/modules/issues/issue.repository.interface.js";

const mockRepo: IssueRepository = {
    findAll: vi.fn(async () => []),
    findById: vi.fn(async () => undefined),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
}

describe("Issue Service Factory", () => {
    describe("listIssues", () => {
        it("should return all issues using repository", async () => {
            const service = createIssueService(mockRepo)
            const result = await service.listIssues()
            expect(result).toEqual([])
            expect(mockRepo.findAll).toHaveBeenCalledOnce()
        })
    })
})