import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./users";

export const session = sqliteTable(
	"session",
	{
		id: text("id").primaryKey().notNull(),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
	},
	table => {
		return {
			expiresAtIdx: index("idx_session_expires_at").on(table.expiresAt),
		};
	},
);
