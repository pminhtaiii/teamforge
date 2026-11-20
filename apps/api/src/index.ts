import express from "express";
import { issueRouter } from "./modules/issues/issue.routes.js";

const app = express();
const PORT = 3000;

app.use(express.json());

app.use("/issues", issueRouter)

app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});

app.listen(PORT, () => {
    console.log(`TeamForge API running on port ${PORT}`);
});