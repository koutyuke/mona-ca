import { blob, index, integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { usersTable } from "./users.table";

export const accountLinkSessionsTable = sqliteTable(
	"account_link_sessions",
	{
		id: text("id").primaryKey().notNull(),
		userId: text("user_id")
			.notNull()
			.references(() => usersTable.id, { onDelete: "cascade" }),
		secretHash: blob("secret_hash", { mode: "buffer" }).notNull(),
		code: text("code"),
		email: text("email").notNull(),
		provider: text("provider", { enum: ["discord", "google"] }).notNull(),
		providerUserId: text("provider_user_id").notNull(),
		expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
	},
	table => [
		index("idx_account_link_sessions__expires_at").on(table.expiresAt),
		unique("unq_account_link_sessions__provider_user").on(table.provider, table.userId),
	],
);
