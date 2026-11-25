import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "../../../src/utils/password.js";

describe("Password Utility", () => {
    describe("hashPassword", () => {
        it("should hash a password", async () => {
            const password = "testing123"
            const hashed = await hashPassword(password)
            expect(typeof hashed).toBe("string")
            expect(hashed).not.toBe(password)
        })

        it("should generate different hashes for the same password", async () => {
            const password = "testing123"
            const hashed1 = await hashPassword(password)
            const hashed2 = await hashPassword(password)
            expect(typeof hashed1).toBe("string")
            expect(typeof hashed2).toBe("string")
            expect(hashed1).not.toBe(hashed2)
        })
    })

    describe("verifyPassword", () => {
        it("should return true when password is correct", async () => {
            const password = "testing123"
            const hashed = await hashPassword(password)
            const result = await verifyPassword(password, hashed)
            expect(result).toBe(true)
        })

        it("should return false when password is incorrect", async () => {
            const password = "testing123"
            const wrongPassword = "wrong123"
            const hashed = await hashPassword(password)
            const result = await verifyPassword(wrongPassword, hashed)
            expect(result).toBe(false)
        }, 15000)
    })
})