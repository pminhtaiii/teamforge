import { Router } from "express";
import { registerSchema, loginSchema } from "./auth.schema.js";
import { createAuthService } from "./auth.service.factory.js";
import { postgresUserRepository } from "../users/user.postgres.repository.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { AppError } from "../../utils/app-error.js";

export const authRouter = Router()
const authService = createAuthService(postgresUserRepository)

authRouter.post("/register", async (req, res) => {
    const parsed = registerSchema.safeParse(req.body)
    if (!parsed.success) {
        return res.status(400).json({
            message: "Validation failed",
            errors: parsed.error.issues
        })
    }
    const user = await authService.register(parsed.data)
    return res.status(201).json(user)
})

authRouter.post("/login", async (req, res) => {
    const parsed = loginSchema.safeParse(req.body)
    if (!parsed.success) {
        return res.status(400).json({
            message: "Validation failed",
            errors: parsed.error.issues
        })
    }
    const user = await authService.login(parsed.data)
    return res.status(200).json(user)
})

authRouter.get("/me", requireAuth, async (req, res) => {
    const userId = req.userId
    if (userId === undefined) {
        throw new AppError("Unauthorized", 401)
    }
    const user = await authService.getCurrentUser(userId)
    return res.status(200).json(user)
})