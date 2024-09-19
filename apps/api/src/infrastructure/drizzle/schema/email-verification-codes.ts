import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./users";

export const emailVerificationCodes = sqliteTable(
	"email_verification_codes",
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
			codeIdx: index("idx_email_verification_codes_code").on(table.code),
		};
	},
);
