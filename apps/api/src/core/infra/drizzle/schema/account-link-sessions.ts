import { blob, index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./users";

export const accountLinkSessions = sqliteTable(
	"account_link_sessions",
	{
		id: text("id").primaryKey().notNull(),
		userId: text("user_id")
			.unique()
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		secretHash: blob("secret_hash", { mode: "buffer" }).notNull(),
		expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
	},
	table => [index("idx_account_link_sessions__expires_at").on(table.expiresAt)],
);
