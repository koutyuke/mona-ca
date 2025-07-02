import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./users";

export const sessions = sqliteTable(
	"sessions",
	{
		id: text("id").primaryKey().notNull(),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
	},
	table => [index("idx_sessions__expires_at").on(table.expiresAt)],
);
