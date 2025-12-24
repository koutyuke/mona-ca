import { blob, integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { usersTable } from "./users.table";

export const emailVerificationRequestsTable = sqliteTable(
	"email_verification_requests",
	{
		id: text("id").primaryKey().notNull(),
		email: text("email").notNull(),
		userId: text("user_id")
			.unique()
			.notNull()
			.references(() => usersTable.id, { onDelete: "cascade" }),
		code: text("code").notNull().unique(),
		secretHash: blob("secret_hash", { mode: "buffer" }).notNull(),
		expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
	},
	table => [unique("unq_email_verification_requests__user_id_email").on(table.userId, table.email)],
);
