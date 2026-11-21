import { randomUUID } from "node:crypto";
import type { Issue, CreateIssueInput, UpdateIssueInput } from "./issue.types.js";

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

export function updateIssue(id: string, input: UpdateIssueInput): Issue | undefined {
    const issue = getIssueById(id)
    if (!issue) {
        return undefined
    }
    if (input.title !== undefined) {
        issue.title = input.title
    }
    if (input.description !== undefined) {
        issue.description = input.description
    }
    if (input.status !== undefined) {
        issue.status = input.status
    }
    return issue
}

export function deleteIssue(id: string): boolean {
    const issue = getIssueById(id)
    if (!issue) {
        return false
    }
    issues.delete(id)
    return true
}

export function clearIssues(): void {
    issues.clear()
}