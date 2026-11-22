import type { Issue, CreateIssueInput, UpdateIssueInput } from "./issue.types.js"

export interface IssueRepository {
    findAll(): Promise<Issue[]>;
    findById(id: string): Promise<Issue | undefined>;
    insert(input: CreateIssueInput): Promise<Issue>;
    update(id: string, input: UpdateIssueInput): Promise<Issue | undefined>;
    delete(id: string): Promise<boolean>;
}
