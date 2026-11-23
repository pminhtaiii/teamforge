import { describe, it, expect } from "vitest";
import { updateIssueSchema } from "../../../src/modules/issues/issue.schema.js";

describe("Issue schema", () => {
    describe("updateIssueSchema", () => {
        it("should reject an empty object", () => {
            const result = updateIssueSchema.safeParse({})
            expect(result.success).toBe(false)
        })

        it("should allow a valid object", () => {
            const result = updateIssueSchema.safeParse({ status: "done" })
            expect(result.success).toBe(true)
        })

        it("should allow a null description", () => {
            const result = updateIssueSchema.safeParse({ description: null })
            expect(result.success).toBe(true)
        })

        it("should prevent invalid status", () => {
            const result = updateIssueSchema.safeParse({ status: "invalid-something" })
            expect(result.success).toBe(false)
        })
    })
})