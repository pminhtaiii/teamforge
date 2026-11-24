import { db } from "../../db/client.js";
import { users } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import type { User, CreateUserInput } from "./user.types.js";

export async function findUserById(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1)
    return result[0]
}

export async function findUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1)
    return result[0]
}

export async function insertUser(input: CreateUserInput): Promise<User> {
    const result = await db.insert(users).values(input).returning()
    if (!result[0]) {
        throw Error("Insertion failed")
    }
    return result[0]
}