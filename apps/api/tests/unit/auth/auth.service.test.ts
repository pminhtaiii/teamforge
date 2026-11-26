import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createAuthService } from "../../../src/modules/auth/auth.service.factory.js";
import type { UserRepository } from "../../../src/modules/users/user.repository.interface.js";
import type { User } from "../../../src/modules/users/user.types.js";
import { hashPassword, verifyPassword } from "../../../src/utils/password.js";
import { verifyAccessToken } from "../../../src/utils/jwt.js";

const mockRepo: UserRepository = {
    findById: vi.fn(),
    findByEmail: vi.fn(),
    insert: vi.fn()
}

const authService = createAuthService(mockRepo)

beforeEach(() => {
    vi.resetAllMocks()
    vi.stubEnv("JWT_SECRET", "test-secret-key-for-unit-testing-only")
})

afterEach(() => {
    vi.unstubAllEnvs()
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
            expect(await verifyPassword(input.password, insertedInput.passwordHash)).toBe(true)
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

        it("should propagate unexpected database errors", async () => {
            const input = {
                name: "Test User",
                email: "test@example.com",
                password: "testing123"
            }
            const dbError = new Error("Database connection failed")
            vi.mocked(mockRepo.findByEmail).mockResolvedValueOnce(undefined)
            vi.mocked(mockRepo.insert).mockRejectedValueOnce(dbError)
            await expect(authService.register(input)).rejects.toBe(dbError)
            expect(mockRepo.insert).toHaveBeenCalledTimes(1)
        })
    })

    describe("login", () => {
        it("should login successfully with valid credentials", async () => {
            const input = {
                email: "test@example.com",
                password: "testing123"
            }
            const mockUser: User = {
                id: "user-1",
                name: "Test User",
                email: input.email,
                passwordHash: await hashPassword(input.password),
                createdAt: new Date()
            }
            vi.mocked(mockRepo.findByEmail).mockResolvedValueOnce(mockUser)
            const result = await authService.login(input)
            expect(result.user.id).toBe(mockUser.id)
            expect(result.user.name).toBe(mockUser.name)
            expect(result.user.email).toBe(mockUser.email)
            expect(result.user.createdAt).toEqual(mockUser.createdAt)
            expect(result.user).not.toHaveProperty("passwordHash")
            expect(typeof result.accessToken).toBe("string")
        })

        it("should normalize email before logging in", async () => {
            const input = {
                email: "  TEST@Example.COM  ",
                password: "testing123"
            }
            const mockUser: User = {
                id: "user-1",
                name: "Test User",
                email: "test@example.com",
                passwordHash: await hashPassword(input.password),
                createdAt: new Date()
            }
            vi.mocked(mockRepo.findByEmail).mockResolvedValueOnce(mockUser)
            await authService.login(input)
            expect(mockRepo.findByEmail).toHaveBeenCalledWith("test@example.com")
        })

        it("should reject login when email does not exist", async () => {
            const input = {
                email: "test@example.com",
                password: "testing123"
            }
            vi.mocked(mockRepo.findByEmail).mockResolvedValueOnce(undefined)
            await expect(authService.login(input)).rejects.toMatchObject({
                message: "Invalid email or password",
                statusCode: 401
            })
        })

        it("should reject login when password is incorrect", async () => {
            const input = {
                email: "test@example.com",
                password: "wrongPassword"
            }
            const mockUser: User = {
                id: "user-1",
                name: "Test User",
                email: input.email,
                passwordHash: await hashPassword("testing123"),
                createdAt: new Date()
            }
            vi.mocked(mockRepo.findByEmail).mockResolvedValueOnce(mockUser)
            await expect(authService.login(input)).rejects.toMatchObject({
                message: "Invalid email or password",
                statusCode: 401
            })
        })

        it("should return an access token containing the correct user ID", async () => {
            const input = {
                email: "test@example.com",
                password: "testing123"
            }
            const mockUser: User = {
                id: "user-1",
                name: "Test User",
                email: input.email,
                passwordHash: await hashPassword(input.password),
                createdAt: new Date()
            }
            vi.mocked(mockRepo.findByEmail).mockResolvedValueOnce(mockUser)
            const result = await authService.login(input)
            expect(verifyAccessToken(result.accessToken)).toBe(mockUser.id)
        })

        it("should propagate unexpected database errors during login", async () => {
            const input = {
                email: "test@example.com",
                password: "testing123"
            }
            const dbError = new Error("Database connection failed")
            vi.mocked(mockRepo.findByEmail).mockRejectedValueOnce(dbError)
            await expect(authService.login(input)).rejects.toBe(dbError)
            expect(mockRepo.findByEmail).toHaveBeenCalledTimes(1)
        })
    })
})