import { blob, index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const signupSessionsTable = sqliteTable(
	"signup_sessions",
	{
		id: text("id").primaryKey().notNull(),
		email: text("email").notNull(),
		emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
		code: text("code").notNull(),
		secretHash: blob("secret_hash", { mode: "buffer" }).notNull(),
		expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
	},
	table => [index("idx_signup_sessions__expires_at").on(table.expiresAt)],
);
