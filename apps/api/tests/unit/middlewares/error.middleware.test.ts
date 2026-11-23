import { describe, it, expect, vi } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { errorHandler } from "../../../src/middlewares/error.middleware.js";

describe("Error Middleware", () => {
    it("should return HTTP 500 when an error occurs", () => {
        const err = new Error("Database connection failed")
        const req = {} as Request
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        } as unknown as Response
        const next = vi.fn() as NextFunction
        errorHandler(err, req, res, next)
        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.json).toHaveBeenCalledWith({
            message: "Internal Server Error"
        })
    })
})