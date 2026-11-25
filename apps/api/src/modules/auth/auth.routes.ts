import { Router } from "express";
import { registerSchema } from "./auth.schema.js";
import { createAuthService } from "./auth.service.factory.js";
import { postgresUserRepository } from "../users/user.postgres.repository.js";

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