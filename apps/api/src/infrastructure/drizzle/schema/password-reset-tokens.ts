import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./users";

export const passwordResetTokens = sqliteTable(
	"password_reset_tokens",
	{
		id: text("id").primaryKey().notNull(),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		hashedToken: text("hashed_token").notNull().unique(),
		expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
	},
	table => {
		return {
			hashedTokenIdx: index("idx_password_reset_token_hashed_token").on(table.hashedToken),
			expiresAtIdx: index("idx_password_reset_token_expires_at").on(table.expiresAt),
		};
	},
);
