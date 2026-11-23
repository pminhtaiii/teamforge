import { describe, it, expect } from "vitest";
import { updateIssueSchema } from "../../../src/modules/issues/issue.schema.js";

describe("Issue schema", () => {
    describe("updateIssueSchema", () => {
        it("should reject an empty object", () => {
            const result = updateIssueSchema.safeParse({})
            expect(result.success).toBe(false)
        })

        it("should allow an valid object", () => {
            const result = updateIssueSchema.safeParse({ status: "done" })
            expect(result.success).toBe(true)
        })
    })
})