import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import { postgresIssueRepository } from "../../src/modules/issues/issue.postgres.repository.js";
import type { Issue } from "../../src/modules/issues/issue.types.js";
import { beforeEach } from "node:test";
import { response } from "express";

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
    beforeEach(() => {
        vi.clearAllMocks()
    })

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

        it("should return HTTP 400 when there's no title", async () => {
            const response = await request(app).post("/issues").send({ description: "No title provided" })
            expect(response.status).toBe(400)
            expect(response.body.message).toBe("Validation failed")
            expect(postgresIssueRepository.insert).not.toHaveBeenCalled()
        })
    })

    describe("GET /issues", () => {
        it("should return an empty array when no issues exist", async () => {
            vi.mocked(postgresIssueRepository.findAll).mockResolvedValueOnce([])
            const response = await request(app).get("/issues")
            expect(response.status).toBe(200)
            expect(response.body).toEqual([])
            expect(postgresIssueRepository.findAll).toHaveBeenCalledOnce()
        })

        it("should return all issues", async () => {
            const issues: Issue[] = [
            {
                id: "issue-1",
                title: "Learning TypeScript",
                description: null,
                status: "todo",
                createdAt: new Date()
            },
            {
                id: "issue-2",
                title: "Build TeamForge",
                description: "Backend development",
                status: "in_progress",
                createdAt: new Date()
            }
            ]
            vi.mocked(postgresIssueRepository.findAll).mockResolvedValueOnce(issues)
            const response = await request(app).get("/issues")
            expect(response.status).toBe(200)
            expect(response.body).toHaveLength(2)
            expect(response.body[0].title).toBe(issues[0]?.title)
            expect(response.body[1].title).toBe(issues[1]?.title)
            expect(postgresIssueRepository.findAll).toHaveBeenCalledOnce()
        })

        it("should return HTTP 500 when repository fails", async () => {
            vi.mocked(postgresIssueRepository.findAll).mockRejectedValueOnce(new Error("Database connection failed"))
            const response = await request(app).get("/issues")
            expect(response.status).toBe(500)
            expect(response.body).toEqual({ message: "Internal Server Error" })
        })
    })
})