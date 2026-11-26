import type { RequestHandler } from "express";
import { AppError } from "../utils/app-error.js";
import { verifyAccessToken } from "../utils/jwt.js";
import { JsonWebTokenError } from "jsonwebtoken";

export const requireAuth: RequestHandler = (req, res, next) => {
    const authorization = req.headers.authorization
    if (!authorization) {
        throw new AppError("Authorization header is missing", 401)
    }
    if (!authorization.startsWith("Bearer ")) {
        throw new AppError("Invalid authorization format", 401)
    }
    const token = authorization.slice(7).trim()
    if (!token) {
        throw new AppError("Access token is missing", 401)
    }

    let userId: string
    try {
        userId = verifyAccessToken(token)
    } catch (error) {
        if (error instanceof JsonWebTokenError) {
            throw new AppError("Invalid or expired access token", 401)
        }
        throw error
    }
    req.userId = userId
    next()
}