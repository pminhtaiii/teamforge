import type { IssueRepository } from "./issue.repository.interface.js";
import type { Issue, CreateIssueInput, UpdateIssueInput } from "./issue.types.js";

export function createIssueService(repo: IssueRepository) {
    return {
        async listIssues(): Promise<Issue[]> {
            return repo.findAll()
        },
        async getIssueById(id: string): Promise<Issue | undefined> {
            const result = await repo.findById(id)
            return result
        }
        async createIssue(input: )
    }
}