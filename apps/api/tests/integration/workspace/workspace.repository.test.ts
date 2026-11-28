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
        }
    })
})