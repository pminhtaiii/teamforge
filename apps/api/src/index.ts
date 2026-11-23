import express from "express";
import { issueRouter } from "./modules/issues/issue.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();
const PORT = 3000;

app.use(express.json());

app.use("/issues", issueRouter)

app.use(errorHandler)

app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});

app.listen(PORT, () => {
    console.log(`TeamForge API running on port ${PORT}`);
});