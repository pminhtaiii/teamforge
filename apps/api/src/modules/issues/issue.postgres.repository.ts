import type { IssueRepository } from "./issue.repository.interface.js";
import { findAllIssues, findIssueById, insertIssue, updateIssueInDb, deleteIssueFromDb } from "./issue.repository.js";

export const postgresIssueRepository: IssueRepository = {
    findAll: findAllIssues,
    findById: findIssueById,
    insert: insertIssue,
    update: updateIssueInDb,
    delete: deleteIssueFromDb
}