import { randomUUID } from "node:crypto";
import type { Issue, CreateIssueInput } from "./issue.types.js";

const issues = new Map<string, Issue>()

export function createIssue(input: CreateIssueInput): Issue {
    const newIssue: Issue = {
        "id": randomUUID(),
        "title": input.title,
        "description": input.description ?? null,
        "status": "todo",
        "createdAt": new Date()
    }
    issues.set(newIssue.id, newIssue);
    return newIssue
}

export function getIssueById(id: string): Issue | undefined {
    return issues.get(id)
}

export function listIssues(): Issue[] {
    return [...issues.values()]
}