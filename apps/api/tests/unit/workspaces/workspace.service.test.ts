import { describe, it, expect, vi, beforeEach } from "vitest";
import { createWorkspaceService } from "../../../src/modules/workspaces/workspace.service.factory.js";
import type { WorkspaceRepository } from "../../../src/modules/workspaces/workspace.repository.interface.js";
import type {
    Workspace,
    WorkspaceMember,
    WorkspaceWithRole
} from "../../../src/modules/workspaces/workspace.types.js";

describe("Workspace Service", () => {
    let repo: WorkspaceRepository
    let service: ReturnType<typeof createWorkspaceService>

    beforeEach(() => {
        repo = {
            findById: vi.fn(),
            findAllByUserId: vi.fn(),
            findMembership: vi.fn(),
            createWithOwner: vi.fn()
        }
        service = createWorkspaceService(repo)
    })

    it("should create workspace with owner successfully", async () => {
        const userId = "user-1"
        const input = {
            name: "Backend"
        }
        const mockWorkspace: WorkspaceWithRole = {
            id: "workspace-1",
            name: "Backend",
            role: "owner",
            createdAt: new Date()
        }
        vi.mocked(repo.createWithOwner).mockResolvedValue(mockWorkspace)
        const workspace = await service.createWorkspace(input, userId)
        expect(workspace).toEqual(mockWorkspace)
        expect(repo.createWithOwner).toHaveBeenCalledWith(input, userId)
        expect(repo.createWithOwner).toHaveBeenCalledOnce()
    })

    it("should propagate repository error when creating workspace", async () => {
        const userId = "user-1"
        const input = {
            name: "Backend"
        }
        const error = new Error("Database error")
        vi.mocked(repo.createWithOwner).mockRejectedValue(error)
        await expect(service.createWorkspace(input, userId)).rejects.toThrow(error)
        expect(repo.createWithOwner).toHaveBeenCalledWith(input, userId)
        expect(repo.createWithOwner).toHaveBeenCalledOnce()
    })

    it("should return workspaces for a user", async () => {
        const userId = "user-1"
        const mockWorkspaces: WorkspaceWithRole[] = [
            {
                id: "workspace-1",
                name: "Backend",
                role: "owner",
                createdAt: new Date()
            },
            {
                id: "workspace-2",
                name: "Frontend",
                role: "member",
                createdAt: new Date()
            }
        ]
        vi.mocked(repo.findAllByUserId).mockResolvedValue(mockWorkspaces)
        const result = await service.listWorkspaces(userId)
        expect(result).toEqual(mockWorkspaces)
        expect(repo.findAllByUserId).toHaveBeenCalledWith(userId)
        expect(repo.findAllByUserId).toHaveBeenCalledOnce()
    })

    it("should return an empty array when user has no workspaces", async () => {
        const userId = "user-1"
        vi.mocked(repo.findAllByUserId).mockResolvedValue([])
        const result = await service.listWorkspaces(userId)
        expect(result).toEqual([])
        expect(repo.findAllByUserId).toHaveBeenCalledWith(userId)
        expect(repo.findAllByUserId).toHaveBeenCalledOnce()
    })
})