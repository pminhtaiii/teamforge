export type WorkspaceRole = "owner" | "admin" | "member"

export interface Workspace {
    id: string;
    name: string;
    createdAt: Date;
}

export interface WorkspaceMember {
    userId: string;
    workspaceId: string;
    role: WorkspaceRole;
    createdAt: Date;
}

export interface CreateWorkspaceInput {
    name: string;
}

export interface WorkspaceWithRole extends Workspace {
    role: WorkspaceRole;
}