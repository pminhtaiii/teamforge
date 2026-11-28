import { describe, it, expect } from "vitest";
import { toPublicUser } from "../../../src/modules/users/user.mapper.js";
import type { User } from "../../../src/modules/users/user.types.js";

describe("User Mapper", () => {
    it("should map User to PublicUser correctly", () => {
        const user: User = {
            id: "user-1",
            name: "Test User",
            email: "test@example.com",
            passwordHash: "fake-password-hash",
            createdAt: new Date()
        }
        const mappedUser = toPublicUser(user)
        expect(mappedUser).toEqual({
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt
        })
    })

    it("should exclude passwordHash from public user", () => {
        const user: User = {
            id: "user-1",
            name: "Test User",
            email: "test@example.com",
            passwordHash: "fake-password-hash",
            createdAt: new Date()
        }
        const mappedUser = toPublicUser(user)
        expect(mappedUser).not.toHaveProperty("passwordHash")
    })

    it("should not mutate the original user", () => {
        const user: User = {
            id: "user-1",
            name: "Test User",
            email: "test@example.com",
            passwordHash: "fake-password-hash",
            createdAt: new Date()
        }
        const originalUser = { ...user }
        const mappedUser = toPublicUser(user)
        expect(user).toEqual(originalUser)
        expect(mappedUser).not.toBe(user)
    })
})