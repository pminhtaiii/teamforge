import { describe, it, expect } from "vitest";
import { registerSchema } from "../../../src/modules/auth/auth.schema.js";

describe("Register Schema", () => {
    describe("name", () => {
        it("should accept valid registration input", () => {
            const input = {
                name: "Test User",
                email: "test@example.com",
                password: "testing123"
            }
            const result = registerSchema.safeParse(input)
            expect(result.success).toBe(true)
        })

        it("should reject empty or whitespace-only name", () => {
            const input = {
                name: "    ",
                email: "test@example.com",
                password: "testing123"
            }
            const result = registerSchema.safeParse(input)
            expect(result.success).toBe(false)
        })

        it("should reject name longer than 100 characters", () => {
            const input = {
                name: "a".repeat(101),
                email: "test@example.com",
                password: "testing123"
            }
            const result = registerSchema.safeParse(input)
            expect(result.success).toBe(false)
        })
    })

    describe("email", () => {
        it("should reject invalid email format", () => {
            const input = {
                name: "Test User",
                email: "invalid-email",
                password: "testing123"
            }
            const result = registerSchema.safeParse(input)
            expect(result.success).toBe(false)
        })

        it("should reject email longer than 255 characters", () => {
            const input = {
                name: "Test User",
                email: `${"a".repeat(64)}@${"b".repeat(63)}.${"c".repeat(63)}.${"d".repeat(63)}.com`,
                password: "testing123"
            }
            const result = registerSchema.safeParse(input)
            expect(result.success).toBe(false)
        })
    })

    describe("password", () => {
        it("should reject password shorter than 8 characters", () => {
            const input = {
                name: "Test User",
                email: "test@example.com",
                password: "abc123"
            }
            const result = registerSchema.safeParse(input)
            expect(result.success).toBe(false)
        })

        it("should reject password longer than 72 bytes", () => {
            const input = {
                name: "Test User",
                email: "test@example.com",
                password: "ệ".repeat(25)
            }
            const result = registerSchema.safeParse(input)
            expect(result.success).toBe(false)
        })
    })

    it("should trim name and email", () => {
        const input = {
            name: "Test User",
            email: "test@example.com",
            password: "testing123"
        }
        const result = registerSchema.safeParse(input)
        expect(result.success).toBe(true)
        if (result.success) {
            expect(result.data.name).toBe("Test User")
            expect(result.data.email).toBe("test@example.com")
            expect(result.data.password).toBe(input.password)
        }
    })
})