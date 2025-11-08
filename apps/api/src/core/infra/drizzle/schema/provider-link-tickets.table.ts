import { blob, index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { usersTable } from "./users.table";

export const providerLinkTicketsTable = sqliteTable(
	"provider_link_tickets",
	{
		id: text("id").primaryKey().notNull(),
		userId: text("user_id")
			.unique()
			.notNull()
			.references(() => usersTable.id, { onDelete: "cascade" }),
		secretHash: blob("secret_hash", { mode: "buffer" }).notNull(),
		expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
	},
	table => [index("idx_provider_link_tickets__expires_at").on(table.expiresAt)],
);
