import type { WorkspaceRepository } from "./workspace.repository.interface.js";
import {
    findWorkspaceById,
    findWorkspacesByUserId,
    findMembership,
    createWorkspaceWithOwner
} from "./workspace.repository.js";

export const postgresWorkspaceRepository: WorkspaceRepository = {
    findById: findWorkspaceById,
    findAllByUserId: findWorkspacesByUserId,
    findMembership,
    createWithOwner: createWorkspaceWithOwner
}