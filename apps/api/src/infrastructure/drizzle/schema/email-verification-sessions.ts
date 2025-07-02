import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { users } from "./users";

export const emailVerificationSessions = sqliteTable(
	"email_verification_sessions",
	{
		id: text("id").primaryKey().notNull(),
		email: text("email").notNull(),
		userId: text("user_id")
			.unique()
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		code: text("code").notNull().unique(),
		expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
	},
	table => [unique("unq_email_verification_sessions__user_id_email").on(table.userId, table.email)],
);
