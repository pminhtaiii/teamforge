import { db } from "../../db/client.js";
import { workspaces, workspaceMembers } from "../../db/schema.js";
import { eq, and } from "drizzle-orm";
import type { Workspace, WorkspaceWithRole, WorkspaceMember } from "./workspace.types.js";

export async function findWorkspaceById(workspaceId: string): Promise<Workspace | undefined> {
    const result = await db.select().from(workspaces).where(eq(workspaces.id, workspaceId)).limit(1)
    return result[0]
}

export async function findWorkspacesByUserId(userId: string): Promise<WorkspaceWithRole[]> {
    const result = await db.select({
        id: workspaces.id,
        name: workspaces.name,
        createdAt: workspaces.createdAt,
        role: workspaceMembers.role
    }).from(workspaces)
    .innerJoin(workspaceMembers, eq(workspaces.id, workspaceMembers.workspaceId))
    .where(eq(workspaceMembers.userId, userId))
    return result;
}

export async function findMembership(userId: string, workspaceId: string): Promise<WorkspaceMember | undefined> {
    const result = await db.select().from(workspaceMembers).where(
        and(
            eq(workspaceMembers.userId, userId),
            eq(workspaceMembers.workspaceId, workspaceId)
        )
    ).limit(1)
    return result[0]
}