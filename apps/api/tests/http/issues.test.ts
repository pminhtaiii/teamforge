import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import { postgresIssueRepository } from "../../src/modules/issues/issue.postgres.repository.js";
import type { Issue, UpdateIssueInput, CreateIssueInput } from "../../src/modules/issues/issue.types.js";
import { beforeEach } from "node:test";
import { response } from "express";
import { id } from "zod/v4/locales";
import { Update } from "drizzle-orm";

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

    describe("GET /issues/:id", () => {
        it("should return HTTP 200 for an issue when ID exists", async () => {
            const issue: Issue = {
                id: "550e8400-e29b-41d4-a716-446655440000",
                title: "Learning TypeScript",
                description: null,
                status: "todo",
                createdAt: new Date()
            }
            vi.mocked(postgresIssueRepository.findById).mockResolvedValueOnce(issue)
            const response = await request(app).get(`/issues/${issue.id}`)
            expect(response.status).toBe(200)
            expect(response.body.title).toBe(issue.title)
            expect(response.body.id).toBe(issue.id)
            expect(postgresIssueRepository.findById).toHaveBeenCalledOnce()
            expect(postgresIssueRepository.findById).toHaveBeenCalledWith(issue.id)
        })

        it("should return HTTP 404 when issue does not exist", async () => {
            const id = "550e8400-e29b-41d4-a716-446655440000"
            vi.mocked(postgresIssueRepository.findById).mockResolvedValueOnce(undefined)
            const response = await request(app).get(`/issues/${id}`)
            expect(response.status).toBe(404)
            expect(response.body.message).toBe("Issue not found")
            expect(postgresIssueRepository.findById).toHaveBeenCalledOnce()
            expect(postgresIssueRepository.findById).toHaveBeenCalledWith(id)
        })

        it("should return HTTP 400 when ID is invalid", async () => {
            const id = "invalid-something"
            const response = await request(app).get(`/issues/${id}`)
            expect(response.status).toBe(400)
            expect(response.body.message).toBe("Invalid issue ID")
            expect(postgresIssueRepository.findById).not.toHaveBeenCalled()
        })

        it("should return HTTP 500 when repository fails", async () => {
            const id = "550e8400-e29b-41d4-a716-446655440000"
            vi.mocked(postgresIssueRepository.findById).mockRejectedValueOnce(new Error("Database error"))
            const response = await request(app).get(`/issues/${id}`)
            expect(response.status).toBe(500)
            expect(response.body.message).toBe("Internal Server Error")
            expect(postgresIssueRepository.findById).toHaveBeenCalledOnce()
            expect(postgresIssueRepository.findById).toHaveBeenCalledWith(id)
        })
    })

    describe("PATCH /issues/:id", () => {
        it("should update an existing issue and return HTTP 200", async () => {
            const issue: Issue = {
                id: "550e8400-e29b-41d4-a716-446655440000",
                title: "Learning TypeScript",
                description: null,
                status: "todo",
                createdAt: new Date()
            };
            const input: UpdateIssueInput = {
                status: "in_progress"
            }
            const updatedIssue: Issue = {
                ...issue,
                status: "in_progress"
            }
            vi.mocked(postgresIssueRepository.update).mockResolvedValueOnce(updatedIssue)
            const response = await request(app).patch(`/issues/${issue.id}`).send(input)
            expect(response.status).toBe(200)
            expect(response.body.id).toBe(issue.id)
            expect(response.body.status).toBe("in_progress")
            expect(response.body.title).toBe(issue.title)
            expect(postgresIssueRepository.update).toHaveBeenCalledOnce()
            expect(postgresIssueRepository.update).toHaveBeenCalledWith(issue.id, input)
        })

        it("should return HTTP 404 when issue does not exist", async () => {
            const id = "550e8400-e29b-41d4-a716-446655440000"
            const input: UpdateIssueInput = {
                status: "done"
            }
            vi.mocked(postgresIssueRepository.update).mockResolvedValueOnce(undefined)
            const response = await request(app).patch(`/issues/${id}`).send(input)
            expect(response.status).toBe(404)
            expect(response.body.message).toBe("Issue not found")
            expect(postgresIssueRepository.update).toHaveBeenCalledOnce()
            expect(postgresIssueRepository.update).toHaveBeenCalledWith(id, input)
        })

        it("should return HTTP 400 when ID is invalid", async () => {
            const id = "invalid-something"
            const input: UpdateIssueInput = {
                status: "done"
            }
            const response = await request(app).patch(`/issues/${id}`).send(input)
            expect(response.status).toBe(400)
            expect(response.body.message).toBe("Validation failed")
            expect(postgresIssueRepository.update).not.toHaveBeenCalled()
        })

        it("should return HTTP 400 when status is invalid", async () => {
            const id = "550e8400-e29b-41d4-a716-446655440000"
            const input = {
                status: "invalid-something"
            }
            const response = await request(app).patch(`/issues/${id}`).send(input)
            expect(response.status).toBe(400)
            expect(response.body.message).toBe("Validation failed")
            expect(postgresIssueRepository.update).not.toHaveBeenCalled()
        })

        it("should return HTTP 400 when body is empty", async () => {
            const id = "550e8400-e29b-41d4-a716-446655440000"
            const input = {}
            const response = await request(app).patch(`/issues/${id}`).send(input)
            expect(response.status).toBe(400)
            expect(response.body.message).toBe("Validation failed")
            expect(postgresIssueRepository.update).not.toHaveBeenCalled()
        })

        it("should return HTTP 500 when repository fails", async () => {
            const id = "550e8400-e29b-41d4-a716-446655440000"
            const input: UpdateIssueInput = {
                status: "done"
            }
            vi.mocked(postgresIssueRepository.update).mockRejectedValueOnce(new Error("Database error"))
            const response = await request(app).patch(`/issues/${id}`).send(input)
            expect(response.status).toBe(500)
            expect(response.body.message).toBe("Internal Server Error")
            expect(postgresIssueRepository.update).toHaveBeenCalledOnce()
            expect(postgresIssueRepository.update).toHaveBeenCalledWith(id, input)
        })
    })
})