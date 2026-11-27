import {
    describe, it, expect, vi,
    beforeEach, afterEach
} from "vitest";
import type { Request, Response, NextFunction } from "express";
import { requireAuth } from "../../../src/middlewares/auth.middleware.js";
import { generateAccessToken } from "../../../src/utils/jwt.js";
import { AppError } from "../../../src/utils/app-error.js";

let req: Request
let res: Response
let next: NextFunction

beforeEach(() => {
    req = {
        headers: {}
    } as Request

    res = {} as Response

    next = vi.fn()

    vi.stubEnv("JWT_SECRET", "test-secret-key-for-unit-testing-only")
})

afterEach(() => {
    vi.unstubAllEnvs()
})

describe("Authentication Middleware", () => {
    it("should reject requests without authorization header", () => {
        expect(() => requireAuth(req, res, next)).toThrow(AppError)
        expect(next).not.toHaveBeenCalled()
        expect(req.userId).toBeUndefined()
    })

    it("should reject invalid authorization format", () => {
        req.headers.authorization = "Basic abc123"
        expect(() => requireAuth(req, res, next)).toThrow(expect.objectContaining({
            message: "Invalid authorization format",
            statusCode: 401
        }))
        expect(next).not.toHaveBeenCalled()
        expect(req.userId).toBeUndefined()
    })

    it("should reject requests without access token", () => {
        req.headers.authorization = "Bearer "
        expect(() => requireAuth(req, res, next)).toThrow(expect.objectContaining({
            message: "Access token is missing",
            statusCode: 401
        }))
        expect(next).not.toHaveBeenCalled()
        expect(req.userId).toBeUndefined()
    })

    it("should reject invalid access token", () => {
        req.headers.authorization = "Bearer invalid-token"
        expect(() => requireAuth(req, res, next)).toThrow(expect.objectContaining({
            message: "Invalid or expired access token",
            statusCode: 401
        }))
        expect(next).not.toHaveBeenCalled()
        expect(req.userId).toBeUndefined()
    })

    it("should reject expired access token", () => {
        vi.useFakeTimers()
        try {
            const token = generateAccessToken("user-1")
            vi.advanceTimersByTime(2 * 60 * 60 * 1000)
            req.headers.authorization = `Bearer ${token}`
            expect(() => requireAuth(req, res, next)).toThrow(expect.objectContaining({
                message: "Invalid or expired access token",
                statusCode: 401 
            }))
            expect(next).not.toHaveBeenCalled()
            expect(req.userId).toBeUndefined()
        } finally {
            vi.useRealTimers()
        }
    })

    it("should authenticate requests with valid access", () => {
        const userId = "user-1"
        const token = generateAccessToken(userId)
        req.headers.authorization = `Bearer ${token}`
        requireAuth(req, res, next)
        expect(req.userId).toBe(userId)
        expect(next).toHaveBeenCalledOnce()
        expect(next).toHaveBeenCalledWith()
    })

    it("should propagate unexpected errors when JWT_SECRET is missing", () => {
        const token = generateAccessToken("user-1")
        req.headers.authorization = `Bearer ${token}`
        vi.stubEnv("JWT_SECRET", undefined)
        expect(() => requireAuth(req, res, next)).toThrow(expect.objectContaining({
            message: "JWT_SECRET is missing"
        }))
        expect(() => requireAuth(req, res, next)).not.toThrow(AppError)
        expect(next).not.toHaveBeenCalled()
        expect(req.userId).toBeUndefined()
    })
})