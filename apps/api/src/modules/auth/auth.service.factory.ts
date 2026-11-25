import type { UserRepository } from "../users/user.repository.interface.js";
import type { RegisterInput, PublicUser } from "../users/user.types.js";
import { hashPassword } from "../../utils/password.js";
import { randomUUID } from "node:crypto";
import { AppError } from "../../utils/app-error.js";
import { isDuplicateEmailError } from "../../utils/db-error.js";

export function createAuthService(repo: UserRepository) {
    return {
        async register(input: RegisterInput): Promise<PublicUser> {
            const email = input.email.trim().toLowerCase()
            const result = await repo.findByEmail(email)
            if (result !== undefined) {
                throw new AppError("Email already exists", 409)
            }
            const hashedPassword = await hashPassword(input.password)
            try {
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
            } catch(error) {
                if (isDuplicateEmailError(error)) {
                    throw new AppError("Email already exists", 409)
                }
                throw error
            }
        }
    }
}
