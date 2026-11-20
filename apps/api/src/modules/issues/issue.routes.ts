import { Router } from "express";
import { listIssues } from "./issue.service.js";

export const issueRouter = Router()

issueRouter.get("/", (_req, res) => {
    const issues = listIssues()
    return res.json(issues)
})