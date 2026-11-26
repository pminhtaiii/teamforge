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
})