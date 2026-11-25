import type { UserRepository } from "../users/user.repository.interface.js";
import type { RegisterInput, PublicUser } from "../users/user.types.js";
import { hashPassword } from "../../utils/password.js";
import { randomUUID } from "node:crypto";

export function createAuthService(repo: UserRepository) {
    return {
        async register(input: RegisterInput): Promise<PublicUser> {
            const email = input.email.trim().toLowerCase()
            const result = await repo.findByEmail(email)
            if (result !== undefined) {
                throw new Error("Email already exists")
            }
            const hashedPassword = await hashPassword(input.password)
            const user = await repo.insert({
                name: input.name,
                email: email,
                passwordHash: hashedPassword
            })
            return {
                id: user.id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt
            }
        }
    }
}
