import { pgTable, pgEnum, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core"

export const issueStatusEnum = pgEnum("issue_status", [
    "todo",
    "in_progress",
    "done"
])

export const issues = pgTable("issues", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    status: issueStatusEnum("status").default("todo").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull()
})

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull()
})