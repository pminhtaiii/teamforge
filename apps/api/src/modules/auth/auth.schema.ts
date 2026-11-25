import { z } from "zod";

export const registerSchema = z.object({
    name: z.string().trim().min(1).max(100),
    email: z.string().trim().email().max(255),
    password: z.string().min(8).refine(
        password => Buffer.byteLength(password, "utf8") <= 72,
        { message: "Password must not exceed 72 bytes" }
    )
})