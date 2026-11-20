import { randomUUID } from "node:crypto";
import type { Issue, CreateIssueInput } from "./issue.types.js";

export function createIssue(input: CreateIssueInput): Issue {
    const newIssue: Issue = {
        "id": randomUUID(),
        "title": input.title,
        "description": input.description ?? null,
        "status": "todo",
        "createdAt": new Date()
    }
    return newIssue
}