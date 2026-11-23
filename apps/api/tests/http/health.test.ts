import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";

describe("Health API", () => {
    it("should return HTTP 200 and health status", async () => {
        const response = await request(app).get("/health")
        expect(response.status).toBe(200)
        expect(response.body).toEqual({ status: "ok" })
    })
})