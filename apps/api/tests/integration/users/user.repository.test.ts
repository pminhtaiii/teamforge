import { describe, it, expect, afterAll } from "vitest";
import { db, client } from "../../../src/db/client.js";
import { users } from "../../../src/db/schema.js";
import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { findUserById, findUserByEmail, insertUser } from "../../../src/modules/users/user.repository.js";
import type { CreateUserInput } from "../../../src/modules/users/user.types.js";

describe("User Repository", () => {
    afterAll(async () => {
        await client.end()
    })

    describe("insertUser", () => {
        it("should insert a user into PostgreSQL", async () => {
            const input: CreateUserInput = {
                name: "Test user",
                email: `test-${randomUUID()}@example.com`,
                passwordHash: "fake-password-hash"
            }
            const user = await insertUser(input)
            try {
                expect(user.id).toEqual(expect.any(String))
                expect(user.createdAt).toBeInstanceOf(Date)
                expect(user.name).toBe(input.name)
                expect(user.email).toBe(input.email)
                expect(user.passwordHash).toBe(input.passwordHash)
            } finally {
                await db.delete(users).where(eq(users.id, user.id))
            }
        })

        it("should reject duplicate email", async () => {
            const input: CreateUserInput = {
                name: "Test user",
                email: `test-${randomUUID()}@example.com`,
                passwordHash: "fake-password-hash"
            }
            await insertUser(input)
            try {
                await expect(insertUser(input)).rejects.toMatchObject({
                    cause: { code: "23505" }
                })
            } finally {
                await db.delete(users).where(eq(users.email, input.email))
            }
        })
    })

    describe("findUserById", () => {
        it("should return a user when ID exists", async () => {
            const input: CreateUserInput = {
                name: "Test user",
                email: `test-${randomUUID()}@example.com`,
                passwordHash: "fake-password-hash"
            }
            const user = await insertUser(input)
            try {
                const result = await findUserById(user.id)
                expect(result).toEqual(user)
            } finally {
                await db.delete(users).where(eq(users.id, user.id))
            }
        })

        it("should return undefined when ID does not exist", async () => {
            const id = randomUUID()
            const result = await findUserById(id)
            expect(result).toBeUndefined()
        })
    })

    describe("findUserByEmail", () => {
        it("should return a user when email exists", async () => {
            const input: CreateUserInput = {
                name: "Test user",
                email: `test-${randomUUID()}@example.com`,
                passwordHash: "fake-password-hash"
            }
            const user = await insertUser(input)
            try {
                const result = await findUserByEmail(input.email)
                expect(result).toEqual(user)
            } finally {
                await db.delete(users).where(eq(users.id, user.id))
            }
        })

        it("should return undefined when email does not exist", async () => {
            const email = `test-${randomUUID()}@example.com`
            const result = await findUserByEmail(email)
            expect(result).toBeUndefined()
        })
    })
})
