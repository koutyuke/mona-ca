import { blob, index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { usersTable } from "./users.table";

export const passwordResetSessionsTable = sqliteTable(
	"password_reset_sessions",
	{
		id: text("id").primaryKey().notNull(),
		userId: text("user_id")
			.notNull()
			.references(() => usersTable.id, { onDelete: "cascade" }),
		code: text("code").notNull(),
		secretHash: blob("secret_hash", { mode: "buffer" }).notNull(),
		email: text("email").notNull(),
		emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
		expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
	},
	table => [index("idx_password_reset_sessions__expires_at").on(table.expiresAt)],
);
