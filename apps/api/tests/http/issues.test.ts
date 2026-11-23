import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import { postgresIssueRepository } from "../../src/modules/issues/issue.postgres.repository.js";
import type { Issue } from "../../src/modules/issues/issue.types.js";

vi.mock("../../src/modules/issues/issue.postgres.repository.js", () => ({
    postgresIssueRepository: {
        findAll: vi.fn(),
        findById: vi.fn(),
        insert: vi.fn(),
        update: vi.fn(),
        delete: vi.fn()
    }
}))

describe("Issue API", () => {
    describe("POST /issues", () => {
        it("should return HTTP 400 when title is empty", async () => {
            const response = await request(app).post("/issues").send({ title: "" })
            expect(response.status).toBe(400)
            expect(response.body.message).toBe("Validation failed")
        })

        it("should return HTTP 201 when issue is created", async () => {
            const issue: Issue = {
                id: "issue-1",
                title: "Learning TypeScript",
                description: null,
                status: "todo",
                createdAt: new Date()
            };
            const input = { title: "Learning Typescript" }
            vi.mocked(postgresIssueRepository.insert).mockResolvedValueOnce(issue)
            const response = await request(app).post("/issues").send(input)
            expect(response.status).toBe(201)
            expect(response.body.title).toBe(issue.title)
            expect(response.body.status).toBe("todo")
            expect(postgresIssueRepository.insert).toHaveBeenCalledWith(input)
        })
    })
})