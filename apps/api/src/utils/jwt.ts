import "dotenv/config";
import jwt from "jsonwebtoken";

const ACCESS_TOKEN_EXPIRES_IN = "1h"

function getJwtSecret(): string {
    const secret = process.env.JWT_SECRET
    if (!secret) {
        throw new Error("JWT_SECRET is missing")
    }
    return secret
}

export function generateAccessToken(userId: string): string {
    return jwt.sign(
        { sub: userId },
        getJwtSecret(),
        {
            algorithm: "HS256",
            expiresIn: ACCESS_TOKEN_EXPIRES_IN
        }
    )
}

export function verifyAccessToken(token: string): string {
    const payload = jwt.verify(
        token,
        getJwtSecret(),
        {
            algorithms: ["HS256"]
        }
    )
    if (typeof payload === "string" || typeof payload.sub !== "string" || !payload.sub || typeof payload.exp !== "number") {
        throw new jwt.JsonWebTokenError("Invalid token payload")
    }
    return payload.sub
}