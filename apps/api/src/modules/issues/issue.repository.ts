import { db } from "../../db/client.js";
import { issues } from "../../db/schema.js";
import type { Issue } from "./issue.types.js";

export async function findAllIssues(): Promise<Issue[]> {
    const result = await db.select().from(issues)
    return result
}