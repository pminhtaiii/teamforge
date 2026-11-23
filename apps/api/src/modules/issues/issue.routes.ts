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
    const issue = await issueService.createIssue(parsed.data)
    return res.status(201).json({
        message: "Issue created",
        issue: issue
    })
})

issueRouter.patch("/:id", async (req, res) => {
    const parsedId = issueIdSchema.safeParse(req.params.id)
    const parsedBody = updateIssueSchema.safeParse(req.body)
    if (!parsedId.success) {
        return res.status(400).json({
            message: "Validation failed",
            errors: parsedId.error.issues
        })
    }
    if (!parsedBody.success) {
        return res.status(400).json({
            message: "Validation failed",
            errors: parsedBody.error.issues
        })
    }
    const updatedIssue = await issueService.updateIssue(parsedId.data, parsedBody.data)
    if (!updatedIssue) {
        return res.status(404).json({
            message: "Issue not found"
        })
    }
    return res.status(200).json(updatedIssue)
})

issueRouter.delete("/:id", async (req, res) => {
    const parsedId = issueIdSchema.safeParse(req.params.id)
    if (!parsedId.success) {
        return res.status(400).json({
            message: "Validation failed",
            errors: parsedId.error.issues
        })
    }
    const result = await issueService.deleteIssue(parsedId.data)
    if (!result) {
        return res.status(404).json({
            message: "Issue not found"
        })
    }
    return res.status(204).send()
})