import { describe, it, expect, vi, beforeEach } from "vitest";
import { createAuthService } from "../../../src/modules/auth/auth.service.factory.js";
import type { UserRepository } from "../../../src/modules/users/user.repository.interface.js";
import type { User } from "../../../src/modules/users/user.types.js";
import { AppError } from "../../../src/utils/app-error.js";
import { hashPassword, verifyPassword } from "../../../src/utils/password.js";

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
            await authService.register(input)
            expect(mockRepo.findByEmail).toHaveBeenCalledWith("test@example.com")
            expect(mockRepo.insert).toHaveBeenCalledWith(
                expect.objectContaining({ email: "test@example.com" })
            )
        })

        it("should hash password before inserting user", async () => {
            const input = {
                name: "Test User",
                email: "test@example.com",
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
            await authService.register(input)
            expect(mockRepo.insert).toHaveBeenCalledTimes(1)
            const insertedInput = vi.mocked(mockRepo.insert).mock.calls[0][0]
            expect(insertedInput.passwordHash).not.toBe(input.password)
            expect(await verifyPassword(input.password, insertedInput.passwordHash)).resolves.toBe(true)
        })

        it("should reject registration when email already exists", async () => {
            const input = {
                name: "Test User",
                email: "test@example.com",
                password: "testing123"
            }
            const mockUser: User = {
                id: "user-1",
                name: input.name,
                email: "test@example.com",
                passwordHash: "fake-hash",
                createdAt: new Date()
            }
            vi.mocked(mockRepo.findByEmail).mockResolvedValueOnce(mockUser)
            await expect(authService.register(input)).rejects.toMatchObject({
                message: "Email already exists",
                statusCode: 409
            })
            expect(mockRepo.insert).not.toHaveBeenCalled()
        })

        it("should handle duplicate email race condition", async () => {
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
            vi.mocked(mockRepo.findByEmail).mockResolvedValueOnce(undefined)
            vi.mocked(mockRepo.insert).mockRejectedValueOnce(dbError)
            await expect(authService.register(input)).rejects.toMatchObject({
                message: "Email already exists",
                statusCode: 409
            })
            expect(mockRepo.insert).toHaveBeenCalledTimes(1)
        })
    })
})