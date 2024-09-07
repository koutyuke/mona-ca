import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./users";

export const emailVerificationCode = sqliteTable(
	"email_verification_code",
	{
		id: text("id").primaryKey().notNull(),
		userId: text("user_id")
			.unique()
			.references(() => users.id, { onDelete: "cascade" }),
		code: text("code").notNull().unique(),
		expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
	},
	table => {
		return {
			codeIdx: index("idx_email_verification_code_code").on(table.code),
		};
	},
);
