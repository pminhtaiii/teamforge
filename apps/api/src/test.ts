import { createIssue, listIssues, getIssueById } from "./modules/issues/issues.service.js";

const issue1 = createIssue({ title: "Fix login bug" });
const issue2 = createIssue({ title: "Build dashboard" });

console.log("Issue 1:", getIssueById(issue1.id));
console.log("All issues:", listIssues());