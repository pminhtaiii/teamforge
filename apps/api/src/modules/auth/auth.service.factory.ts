import type { UserRepository } from "../users/user.repository.interface.js";
import type { RegisterInput, PublicUser, LoginInput, LoginResult } from "../users/user.types.js";
import { hashPassword, verifyPassword } from "../../utils/password.js";
import { AppError } from "../../utils/app-error.js";
import { generateAccessToken } from "../../utils/jwt.js";
import { isDuplicateEmailError } from "../../utils/db-error.js";
import { toPublicUser } from "../users/user.mapper.js";

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
                return toPublicUser(user)
            } catch(error) {
                if (isDuplicateEmailError(error)) {
                    throw new AppError("Email already exists", 409)
                }
                throw error
            }
        },

        async login(input: LoginInput): Promise<LoginResult> {
            const email = input.email.trim().toLowerCase()
            const result = await repo.findByEmail(email)
            if (result === undefined) {
                throw new AppError("Invalid email or password", 401)
            }
            const isValidPassword = await verifyPassword(input.password, result.passwordHash)
            if (!isValidPassword) {
                throw new AppError("Invalid email or password", 401)
            }
            const token = generateAccessToken(result.id)
            return {
                user: toPublicUser(result),
                accessToken: token
            }
        },

        async getCurrentUser(userId: string): Promise<PublicUser> {
            const user = await repo.findById(userId)
            if (user === undefined) {
                throw new AppError("User no longer exists", 401)
            }
            return toPublicUser(user)
        },
    }
}
