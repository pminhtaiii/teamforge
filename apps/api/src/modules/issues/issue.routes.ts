import { Router } from "express";
import { createIssue, listIssues, getIssueById, updateIssue } from "./issue.service.js";
import { createIssueSchema, updateIssueSchema } from "./issue.schema.js";

export const issueRouter = Router()

issueRouter.get("/", (_req, res) => {
    const issues = listIssues()
    return res.json(issues)
})

issueRouter.get("/:id", (req, res) => {
    const id = req.params.id
    const issue = getIssueById(id)
    if (issue === undefined) {
        return res.status(404).json({
            "message": "Issue not found"
        })
    }
    return res.status(200).json({
        "message": "Issue found",
        "issue": issue
    })
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

issueRouter.patch("/:id", (req, res) => {
    const id = req.params.id
    const result = updateIssueSchema.safeParse(req.body)
    if (!result.success) {
        return res.status(400).json({
            "message": "Validation failed",
            "errors": result.error.issues
        })
    }
    const updatedIssue = updateIssue(id, result.data)
    if (!updatedIssue) {
        return res.status(404).json({
            "message": "Issue not found",
            "issue": updatedIssue
        })
    }
    return res.status(200).json({
        "message": "Issue updated",
        "updated issue": updatedIssue
    })
})