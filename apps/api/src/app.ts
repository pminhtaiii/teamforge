import express from "express";
import { issueRouter } from "./modules/issues/issue.routes.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";

export const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
    return res.json({ status: "ok" });
});

app.use("/issues", issueRouter);
app.use("/auth", authRouter)

app.use(errorHandler);