import type { UserRepository } from "./user.repository.interface.js";
import { findUserById, findUserByEmail, insertUser } from "./user.repository.js"

export const postgresUserRepository: UserRepository = {
    findById: findUserById,
    findByEmail: findUserByEmail,
    insert: insertUser
}