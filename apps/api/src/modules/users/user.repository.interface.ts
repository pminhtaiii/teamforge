import type { User, CreateUserInput } from "./user.types.js"

export interface UserRepository {
    findById(id: string) : Promise<User | undefined>
    findByEmail(email: string): Promise<User | undefined>
    insert(input: CreateUserInput): Promise<User>
}