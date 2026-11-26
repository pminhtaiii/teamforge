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
            expect(response.body.createdAt).toBe(mockUser.createdAt.toISOString())
            expect(response.body).not.toHaveProperty("passwordHash")
        })

        it("should return 400 when registration input is invalid", async () => {
            const input = {
                name: "",
                email: "invalid-email",
                password: "123"
            }
            const result = await request(app).post("/auth/register").send(input)
            expect(result.status).toBe(400)
            expect(result.body.message).toBe("Validation failed")
            expect(postgresUserRepository.findByEmail).not.toHaveBeenCalled()
            expect(postgresUserRepository.insert).not.toHaveBeenCalled()
        })

        it("should return 409 when email already exists", async () => {
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
            vi.mocked(postgresUserRepository.findByEmail).mockResolvedValueOnce(mockUser)
            const response = await request(app).post("/auth/register").send(input)
            expect(response.status).toBe(409)
            expect(response.body.message).toBe("Email already exists")
            expect(postgresUserRepository.insert).not.toHaveBeenCalled()
        })

        it("should return 409 when duplicate email race condition occurs", async () => {
            const input = {
                name: "Test User",
                email: "test@example.com",
                password: "testing123"
            }
            const dbError = {
                cause: {
                    code: "23505",
                    constraint_name: "users_email_unique"
                }
            }
            vi.mocked(postgresUserRepository.findByEmail).mockResolvedValueOnce(undefined)
            vi.mocked(postgresUserRepository.insert).mockRejectedValueOnce(dbError)
            const response = await request(app).post("/auth/register").send(input)
            expect(response.status).toBe(409)
            expect(response.body.message).toBe("Email already exists")
            expect(postgresUserRepository.insert).toHaveBeenCalledTimes(1)
        })

        it("should return 500 when an unexpected database error occurs", async () => {
            const input = {
                name: "Test User",
                email: "test@example.com",
                password: "testing123"
            }
            const dbError = new Error("Database connection failed")
            vi.mocked(postgresUserRepository.findByEmail).mockResolvedValueOnce(undefined)
            vi.mocked(postgresUserRepository.insert).mockRejectedValueOnce(dbError)
            const response = await request(app).post("/auth/register").send(input)
            expect(response.status).toBe(500)
            expect(response.body.message).toBe("Internal Server Error")
            expect(postgresUserRepository.insert).toHaveBeenCalledTimes(1)
        })
    })
})