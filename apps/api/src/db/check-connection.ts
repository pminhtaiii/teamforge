import { sql } from "drizzle-orm"
import { db, client } from "./client.js"

async function main() {
    try {
        const result = await db.execute(
            sql`SELECT 1 AS connected`
        )
        console.log(result)
    } catch (error) {
        console.log("Database connection failed", error)
        process.exitCode = 1
    } finally {
        await client.end()
    }
}

void main()