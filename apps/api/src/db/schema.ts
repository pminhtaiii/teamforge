import { pgTable, pgEnum, uuid, varchar, text, timestamp, primaryKey } from "drizzle-orm/pg-core"

export const issueStatusEnum = pgEnum("issue_status", [
    "todo",
    "in_progress",
    "done"
])

export const workspaceRoleEnum = pgEnum("workspace_role", [
    "owner",
    "admin",
    "member"
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

export const workspaces = pgTable("workspaces", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length:100 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull()
})

export const workspaceMembers = pgTable("workspace_members", {
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
    role: workspaceRoleEnum("role").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull()
}, (table) => [
    primaryKey({
        columns: [table.userId, table.workspaceId]
    })
])