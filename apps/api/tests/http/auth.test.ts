import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import type { User } from "../../src/modules/users/user.types.js";
import { postgresUserRepository } from "../../src/modules/users/user.postgres.repository.js";

vi.mock(
    "../../src/modules/users/user.postgres.repository.js",
    () => ({
        postgresUserRepository: {
            findById: vi.fn(),
            findByEmail: vi.fn(),
            insert: vi.fn()
        }
    })
)

beforeEach(() => {
    vi.resetAllMocks()
})

describe("Auth API", () => {
    describe("POST /auth/register", () => {
        it("should register a user successfully", async () => {
            const input = {
                name: "Test User",
                email: "test@example.com",
                password: "testing123"
            }
            const mockUser: User = {
                id: "user-1",
                name: input.name,
                email: input.email,
                passwordHash: "fake-hash",
                createdAt: new Date()
            }
            vi.mocked(postgresUserRepository.findByEmail).mockResolvedValueOnce(undefined)
            vi.mocked(postgresUserRepository.insert).mockResolvedValueOnce(mockUser)
            const response = await request(app).post("/auth/register").send(input)
            expect(response.status).toBe(201)
            expect(response.body.name).toBe(mockUser.name)
            expect(response.body.email).toBe(mockUser.email)
            expect(response.body.id).toBe(mockUser.id)
            expect(response.body.createdAt).toBe(mockUser.createdAt)
            expect(response.body).not.toHaveProperty("passwordHash")
        })
    })
})