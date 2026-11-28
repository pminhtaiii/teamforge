import { describe, it, expect, afterAll } from "vitest";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db, client } from "../../../src/db/client.js";
import { users, workspaces, workspaceMembers } from "../../../src/db/schema.js";
import { postgresWorkspaceRepository } from "../../../src/modules/workspaces/workspace.postgres.repository.js";

afterAll(async () => {
    await client.end()
})

describe("Workspace Repository Integration", () => {
    it("should find an existing workspace by ID", async () => {
        const workspaceId = randomUUID()
        const name = "Test Workspace"

        try {
            await db.insert(workspaces).values({
                id: workspaceId,
                name: name
            })
            const result = await postgresWorkspaceRepository.findById(workspaceId)
            expect(result).not.toBeUndefined()
            expect(result?.id).toBe(workspaceId)
            expect(result?.name).toBe(name)
            expect(result?.createdAt).toBeInstanceOf(Date)
        } finally {
            await db.delete(workspaces).where(eq(workspaces.id, workspaceId))
        }
    })

    it("should return undefined when workspace does not exist", async () => {
        const workspaceId = randomUUID()
        const result = await postgresWorkspaceRepository.findById(workspaceId)
        expect(result).toBeUndefined()
    })

    it("should return workspaces with roles for a user", async () => {
        const userId = randomUUID()
        const workspaceId1 = randomUUID()
        const workspaceId2 = randomUUID()
        const workspaceId3 = randomUUID()
        try {
            await db.insert(users).values({
                id: userId,
                name: "Test User",
                email: `${userId}@example.com`,
                passwordHash: "fake-password-hash"
            })
            await db.insert(workspaces).values([
                { id: workspaceId1, name: "Backend" },
                { id: workspaceId2, name: "Frontend" },
                { id: workspaceId3, name: "Personal" }
            ])
            await db.insert(workspaceMembers).values([
                {
                    userId,
                    workspaceId: workspaceId1,
                    role: "owner"
                },
                {
                    userId,
                    workspaceId: workspaceId2,
                    role: "member"
                }
            ])
            const result = await postgresWorkspaceRepository.findAllByUserId(userId)
            expect(result).toHaveLength(2)
            const workspace1 = result.find(workspace => workspace.id === workspaceId1)
            expect(workspace1?.role).toBe("owner")
            const workspace2 = result.find(workspace => workspace.id === workspaceId2)
            expect(workspace2?.role).toBe("member")
            expect(result.some(workspace => workspace.id === workspaceId3)).toBe(false)
        } finally {
            await db.delete(workspaces)
                .where(eq(workspaces.id, workspaceId1))

            await db.delete(workspaces)
                .where(eq(workspaces.id, workspaceId2))

            await db.delete(workspaces)
                .where(eq(workspaces.id, workspaceId3))

            await db.delete(users)
                .where(eq(users.id, userId))
        }
    })

    it("should return an empty array when user has no workspaces", async () => {
        const userId = randomUUID()
        try {
            await db.insert(users).values({
                id: userId,
                name: "Test User",
                email: `${userId}@example.com`,
                passwordHash: "fake-password-hash"
            })
            const result = await postgresWorkspaceRepository.findAllByUserId(userId)
            expect(result).toEqual([])
        } finally {
            await db.delete(users).where(eq(users.id, userId))
        }
    })

    it("should find an existing membership", async () => {
        const userId = randomUUID()
        const workspaceId = randomUUID()
        try {
            await db.insert(users).values({
                id: userId,
                name: "Test User",
                email: `${userId}@example.com`,
                passwordHash: "fake-password-hash"
            })
            await db.insert(workspaces).values([
                { id: workspaceId, name: "Backend" }
            ])
            await db.insert(workspaceMembers).values([
                {
                    userId,
                    workspaceId: workspaceId,
                    role: "owner"
                }
            ])
            const result = await postgresWorkspaceRepository.findMembership(userId, workspaceId)
            expect(result).not.toBeUndefined()
            expect(result?.userId).toBe(userId)
            expect(result?.workspaceId).toBe(workspaceId)
            expect(result?.role).toBe("owner")
            expect(result?.createdAt).toBeInstanceOf(Date)
        } finally {
            await db.delete(workspaces).where(eq(workspaces.id, workspaceId))
            await db.delete(users).where(eq(users.id, userId))
        }
    })

    it("should return undefined when membership does not exist", async () => {
        const userId = randomUUID()
        const workspaceId = randomUUID()
        try {
            await db.insert(users).values({
                id: userId,
                name: "Test User",
                email: `${userId}@example.com`,
                passwordHash: "fake-password-hash"
            })
            await db.insert(workspaces).values([
                { id: workspaceId, name: "Backend" }
            ])
            const result = await postgresWorkspaceRepository.findMembership(userId, workspaceId)
            expect(result).toBeUndefined()
        } finally {
            await db.delete(workspaces).where(eq(workspaces.id, workspaceId))
            await db.delete(users).where(eq(users.id, userId))
        }
    })

    it("should reject membership when user does not exist", async () => {
        const userId = randomUUID()
        const workspaceId = randomUUID()
        try {
            await db.insert(workspaces).values({
                id: workspaceId,
                name: "Backend"
            })
            await expect(
                db.insert(workspaceMembers).values({
                    userId,
                    workspaceId,
                    role: "member"
                })
            ).rejects.toMatchObject({
                cause: {
                    code: "23503"
                }
            })
        } finally {
            await db.delete(workspaces).where(eq(workspaces.id, workspaceId))
        }
    })

    it("should reject membership when user does not exist", async () => {
        const userId = randomUUID()
        const workspaceId = randomUUID()
        try {
            await db.insert(workspaces).values([
                { id: workspaceId, name: "Backend" }
            ])
            await expect(
                db.insert(workspaceMembers).values({
                    userId,
                    workspaceId,
                    role: "member"
                })
            ).rejects.toMatchObject({
                cause: {
                    code: "23503"
                }
            })
        } finally {
            await db.delete(workspaces).where(eq(workspaces.id, workspaceId))
        }
    })

    it("should reject membership when workspace does not exist", async () => {
        const userId = randomUUID()
        const workspaceId = randomUUID()
        try {
            await db.insert(users).values({
                id: userId,
                name: "Test User",
                email: `${userId}@example.com`,
                passwordHash: "fake-password-hash"
            })
            await expect(
                db.insert(workspaceMembers).values({
                    userId,
                    workspaceId,
                    role: "member"
                })
            ).rejects.toMatchObject({
                cause: {
                    code: "23503"
                }
            })
        } finally {
            await db.delete(users).where(eq(users.id, userId))
        }
    })

    it("should cascade delete memberships when workspace is deleted", async () => {
        const userId = randomUUID()
        const workspaceId = randomUUID()
        try {
            await db.insert(users).values({
                id: userId,
                name: "Test User",
                email: `${userId}@example.com`,
                passwordHash: "fake-password-hash"
            })
            await db.insert(workspaces).values({
                id: workspaceId,
                name: "Backend"
            })
            await db.insert(workspaceMembers).values({
                userId,
                workspaceId,
                role: "owner"
            })
            const membershipBefore =
                await postgresWorkspaceRepository.findMembership(userId, workspaceId)
            expect(membershipBefore).not.toBeUndefined()
            expect(membershipBefore?.role).toBe("owner")
            await db.delete(workspaces)
                .where(eq(workspaces.id, workspaceId))
            const workspace =
                await postgresWorkspaceRepository.findById(workspaceId)
            expect(workspace).toBeUndefined()
            const membershipAfter =
                await postgresWorkspaceRepository.findMembership(userId, workspaceId)
            expect(membershipAfter).toBeUndefined()
            const result = await db.select().from(users).where(eq(users.id, userId))
            expect(result).toHaveLength(1)
            expect(result[0]?.id).toBe(userId)
        } finally {
            await db.delete(workspaces)
                .where(eq(workspaces.id, workspaceId))
            await db.delete(users)
                .where(eq(users.id, userId))
        }
    })

    it("should cascade delete memberships when user is deleted", async () => {
        const userId = randomUUID()
        const workspaceId = randomUUID()
        try {
            await db.insert(users).values({
                id: userId,
                name: "Test User",
                email: `${userId}@example.com`,
                passwordHash: "fake-password-hash"
            })
            await db.insert(workspaces).values({
                id: workspaceId,
                name: "Backend"
            })
            await db.insert(workspaceMembers).values({
                userId,
                workspaceId,
                role: "owner"
            })
            const membershipBefore =
                await postgresWorkspaceRepository.findMembership(userId, workspaceId)
            expect(membershipBefore).not.toBeUndefined()
            expect(membershipBefore?.role).toBe("owner")
            await db.delete(users)
                .where(eq(users.id, userId))
            const deletedUser = await db.select().from(users).where(eq(users.id, userId))
            expect(deletedUser).toHaveLength(0)
            const membershipAfter = await postgresWorkspaceRepository.findMembership(userId, workspaceId)
            expect(membershipAfter).toBeUndefined()
            const result = await db.select().from(workspaces).where(eq(workspaces.id, workspaceId))
            expect(result).toHaveLength(1)
            expect(result[0]?.id).toBe(workspaceId)
        } finally {
            await db.delete(workspaces)
                .where(eq(workspaces.id, workspaceId))
            await db.delete(users)
                .where(eq(users.id, userId))
        }
    })
})