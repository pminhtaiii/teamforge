import { Router } from "express";
import { createIssueService } from "./issue.service.factory.js";
import { postgresIssueRepository } from "./issue.postgres.repository.js";
import { createIssue, listIssues, getIssueById, updateIssue, deleteIssue } from "./issue.service.js";
import { createIssueSchema, updateIssueSchema } from "./issue.schema.js";
import { issueIdSchema } from "./issue.schema.js";

export const issueRouter = Router()
const issueService = createIssueService(postgresIssueRepository)

issueRouter.get("/", async (_req, res) => {
    const issues = await issueService.listIssues()
    return res.json(issues)
})

issueRouter.get("/:id", async (req, res) => {
    const parsed = issueIdSchema.safeParse(req.params.id)

    if (!parsed.success) {
        return res.status(400).json({
            message: "Invalid issue ID"
        })
    }

    const issue = await issueService.getIssueById(parsed.data)
    if (issue === undefined) {
        return res.status(404).json({
            message: "Issue not found"
        })
    }
    return res.status(200).json(issue)
})

issueRouter.post("/", async (req, res) => {
    const parsed = createIssueSchema.safeParse(req.body)
    if (!parsed.success) {
        return res.status(400).json({
            message: "Validation failed",
            errors: parsed.error.issues
        })
    }
    const issue = createIssue(parsed.data)
    return res.status(201).json({
        message: "Issue created",
        issue: issue
    })
})

issueRouter.patch("/:id", (req, res) => {
    const id = req.params.id
    const result = updateIssueSchema.safeParse(req.body)
    if (!result.success) {
        return res.status(400).json({
            message: "Validation failed",
            errors: result.error.issues
        })
    }
    const updatedIssue = updateIssue(id, result.data)
    if (!updatedIssue) {
        return res.status(404).json({
            message: "Issue not found",
            issue: updatedIssue
        })
    }
    return res.status(200).json({
        message: "Issue updated",
        issue: updatedIssue
    })
})

issueRouter.delete("/:id", (req, res) => {
    const id = req.params.id
    const result = deleteIssue(id)
    if (!result) {
        return res.status(404).json({
            message: "Issue not found"
        })
    }
    return res.status(204).send()
})