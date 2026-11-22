import type { IssueRepository } from "./issue.repository.interface.js";
import type { Issue } from "./issue.types.js";

export function createIssueService(repo: IssueRepository) {
    return {
        async listIssues(): Promise<Issue[]> {
            const result = await repo.findAll()
            return result
        }
    }
}