import { describe, it, expect, vi, beforeEach } from "vitest";
import { createAuthService } from "../../../src/modules/auth/auth.service.factory.js";
import type { UserRepository } from "../../../src/modules/users/user.repository.interface.js";
import type { User } from "../../../src/modules/users/user.types.js";
import { AppError } from "../../../src/utils/app-error.js";

const mockRepo: UserRepository = {
    findById: vi.fn(),
    findByEmail: vi.fn(),
    insert: vi.fn()
}

const authService = createAuthService(mockRepo)

beforeEach(() => {
    vi.resetAllMocks()
})

describe("Auth Service", () => {
    describe("register", () => {
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
            vi.mocked(mockRepo.findByEmail).mockResolvedValueOnce(undefined)
            vi.mocked(mockRepo.insert).mockResolvedValueOnce(mockUser)
            const result = await authService.register(input)
            expect(result.id).toBe(mockUser.id)
            expect(result.name).toBe(mockUser.name)
            expect(result.email).toBe(mockUser.email)
            expect(result.createdAt).toEqual(mockUser.createdAt)
            expect(result).not.toHaveProperty("passwordHash")
        })

        it("should normalize email before registering", async () => {
            const input = {
                name: "Test User",
                email: "  TEST@Example.COM  ",
                password: "testing123"
            }
            const mockUser: User = {
                id: "user-1",
                name: input.name,
                email: "test@example.com",
                passwordHash: "fake-hash",
                createdAt: new Date()
            }
            vi.mocked(mockRepo.findByEmail).mockResolvedValueOnce(undefined)
            vi.mocked(mockRepo.insert).mockResolvedValueOnce(mockUser)
            const result = await authService.register(input)
            expect(mockRepo.findByEmail).toHaveBeenCalledWith("test@example.com")
            expect(mockRepo.insert).toHaveBeenCalledWith(
                expect.objectContaining({ email: "test@example.com" })
            )
        })
    })
})