import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { generateAccessToken, verifyAccessToken } from "../../../src/utils/jwt.js";

beforeEach(() => {
    vi.stubEnv("JWT_SECRET", "test-secret-key-for-unit-testing-only")
})

afterEach(() => {
    vi.unstubAllEnvs()
})

describe("JWT Utility", () => {
    it("should generate an access token", () => {
        const userId = "user-123"
        const accessToken = generateAccessToken(userId)
        expect(typeof accessToken).toBe("string")
        expect(accessToken.split(".")).toHaveLength(3)
    })

    it("should verify a valid access token", () => {
        const userId = "user-123"
        const accessToken = generateAccessToken(userId)
        const result = verifyAccessToken(accessToken)
        expect(result).toBe(userId)
    })

    it("should reject an invalid access token", () => {
        const invalidToken = "invalid-token"
        expect(() => verifyAccessToken(invalidToken)).toThrow("jwt malformed")
    })

    it("should reject a tampered access token", () => {
        const token = generateAccessToken("user-123")
        const parts = token.split(".")
        parts[1] = Buffer.from(JSON.stringify({ sub: "admin-456" })).toString("base64url")
        const tamperedToken = parts.join(".")
        expect(() => verifyAccessToken(tamperedToken)).toThrow("invalid signature")
    })

    it("should reject an expired access token", () => {
        vi.useFakeTimers()
        try {
            const token = generateAccessToken("user-123")
            vi.advanceTimersByTime(2 * 60 * 60 * 1000)
            expect(() => verifyAccessToken(token)).toThrow("jwt expired")
        } finally {
            vi.useRealTimers()
        }
    })
    it("should reject a token signed with a different secret", () => {
        const userId = "user-123"
        const token = generateAccessToken(userId)
        vi.stubEnv("JWT_SECRET", "another-test-secret")
        expect(() => verifyAccessToken(token)).toThrow("invalid signature")
    })
})