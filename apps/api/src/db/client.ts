import "dotenv/config";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
    throw new Error("DATABASE_URL is missing")
}

export const client = postgres(databaseUrl, {
    max: 2,
    prepare: false  
})

export const db = drizzle(client)


