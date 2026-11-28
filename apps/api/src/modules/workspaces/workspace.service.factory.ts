import type {
    WorkspaceRepository
} from "./workspace.repository.interface.js";
import type {
    CreateWorkspaceInput,
    WorkspaceWithRole
} from "./workspace.types.js";
import { AppError } from "../../utils/app-error.js";

export function createWorkspaceService(repo: WorkspaceRepository) {
    return {
        async createWorkspace(input: CreateWorkspaceInput, userId: string): Promise<WorkspaceWithRole> {
            return await repo.createWithOwner(input, userId)
        },
        async listWorkspaces(userId: string): Promise<WorkspaceWithRole[]> {
            return await repo.findAllByUserId(userId)
        },
        async getWorkspace(workspaceId: string, userId: string): Promise<WorkspaceWithRole> {
            const workspace = await repo.findById(workspaceId)
            if (workspace === undefined) {
                throw new AppError("Workspace not found", 404)
            }
            const membership = await repo.findMembership(userId, workspaceId)
            if (membership === undefined) {
                throw new AppError("Access denied", 403)
            }
            return {
                ...workspace,
                role: membership.role
            }
        }
    }
}