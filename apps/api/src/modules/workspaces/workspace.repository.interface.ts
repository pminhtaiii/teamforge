import type {
    Workspace,
    WorkspaceWithRole,
    WorkspaceMember
} from "./workspace.types.js";

export interface WorkspaceRepository {
    findById(workspaceId: string): Promise<Workspace | undefined>;
    findAllByUserId(userId: string): Promise<WorkspaceWithRole[]>;
    findMembership(userId: string, workspaceId: string): Promise<WorkspaceMember | undefined>
}