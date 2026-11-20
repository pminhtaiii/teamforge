import { Router } from "express";
import { createIssue, listIssues, getIssueById } from "./issue.service.js";
import { createIssueSchema } from "./issue.schema.js";

export const issueRouter = Router()

issueRouter.get("/", (_req, res) => {
    const issues = listIssues()
    return res.json(issues)
})

issueRouter.post("/", (req, res) => {
    const result = createIssueSchema.safeParse(req.body)
    if (!result.success) {
        return res.status(400).json({
            "message": "Validation failed",
            "errors": result.error.issues
        })
    }
    const issue = createIssue(result.data)
    return res.status(201).json({
        "message": "Issue created",
        "issue": issue
    })
})