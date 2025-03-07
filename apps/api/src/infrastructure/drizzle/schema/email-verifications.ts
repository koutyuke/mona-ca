import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { users } from "./users";

export const emailVerifications = sqliteTable(
	"email_verifications",
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
	table => {
		return {
			uniqueUserIdAndEmail: unique("unq_email_verifications__user_id_email").on(table.userId, table.email),
		};
	},
);
