import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";

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
    })
})